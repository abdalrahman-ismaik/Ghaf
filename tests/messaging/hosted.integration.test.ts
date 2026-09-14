import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

import {
  readMessagingConfig,
  SupabaseFamilyMessagingService,
} from '../../src/features/familyMessaging/client';
import {
  phraseText,
  type CredentialStorage,
  type MessagingChild,
  type MessagingContext,
  type MessagingConfig,
} from '../../src/features/familyMessaging/contracts';

const enabled = process.env.GHAF_RUN_MESSAGING_HOSTED === '1';

function required(name: string, value: string | undefined, trim = true): string {
  if (!value?.trim()) throw new Error(`Hosted messaging test requires ${name}.`);
  return trim ? value.trim() : value;
}

function exactOrigin(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.origin === value) return url.origin;
  } catch {
    // Reject configuration without exposing its value in a test failure.
  }
  throw new Error('Hosted messaging test requires an exact HTTPS origin without a path.');
}

function dedicatedConfig(): MessagingConfig {
  const expected = exactOrigin(
    required('GHAF_MESSAGING_EXPECTED_ORIGIN', process.env.GHAF_MESSAGING_EXPECTED_ORIGIN),
  );
  const config = readMessagingConfig(
    required('EXPO_PUBLIC_GHAF_MESSAGING_URL', process.env.EXPO_PUBLIC_GHAF_MESSAGING_URL),
    required(
      'EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY',
      process.env.EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY,
    ),
  );
  if (!config || config.url !== expected)
    throw new Error('Messaging configuration does not match the explicit dedicated test origin.');
  const knownPilots = [
    process.env.GHAF_MESSAGING_PILOT_ORIGIN,
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ];
  try {
    const local = readFileSync(new URL('../../.env.pilot.local', import.meta.url), 'utf8');
    const configured = local.match(/^\s*EXPO_PUBLIC_SUPABASE_URL\s*=\s*(.*?)\s*$/m)?.[1];
    if (configured) knownPilots.push(configured.replace(/^(['"])(.*)\1$/, '$2'));
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'))
      throw new Error('Unable to check the local pilot configuration boundary.');
  }
  const pilotOrigins = knownPilots
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => exactOrigin(value.trim()));
  if (!pilotOrigins.length)
    throw new Error('Provide a known pilot origin so the hosted test can reject that project.');
  if (pilotOrigins.includes(config.url))
    throw new Error('Hosted messaging acceptance refuses the adult pilot project.');
  return config;
}

function participant(config: MessagingConfig) {
  let saved: string | null = null;
  let authAccepted = false;
  let logoutAccepted = false;
  const storage: CredentialStorage = {
    async read() {
      return saved;
    },
    async write(value) {
      saved = value;
    },
    async clear() {
      saved = null;
    },
  };
  const observedFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);
    const endpoint = String(input);
    if (
      endpoint === `${config.url}/auth/v1/signup` ||
      endpoint === `${config.url}/auth/v1/token?grant_type=password`
    )
      authAccepted ||= response.ok;
    if (endpoint === `${config.url}/auth/v1/logout?scope=local`) logoutAccepted = response.ok;
    return response;
  };
  return {
    service: new SupabaseFamilyMessagingService(config, storage, observedFetch),
    storage,
    authAccepted: () => authAccepted,
    logoutAccepted: () => logoutAccepted,
  };
}

it.runIf(enabled)(
  'verifies dedicated hosted messaging Auth, delivery, peer boundaries and device revocation',
  async () => {
    const config = dedicatedConfig();
    const email = required(
      'GHAF_MESSAGING_TEST_PARENT_EMAIL',
      process.env.GHAF_MESSAGING_TEST_PARENT_EMAIL,
    );
    const password = required(
      'GHAF_MESSAGING_TEST_PARENT_PASSWORD',
      process.env.GHAF_MESSAGING_TEST_PARENT_PASSWORD,
      false,
    );
    const runId = randomUUID();
    const adult = participant(config);
    const first = participant(config);
    const second = participant(config);
    let parentContext: MessagingContext | null = null;
    let firstContext: MessagingContext | null = null;
    let secondContext: MessagingContext | null = null;
    let firstChild: MessagingChild | null = null;
    let secondChild: MessagingChild | null = null;
    let completed = false;
    const receipt = {
      kind: 'hosted-messaging-http',
      origin: config.url,
      runId,
      startedAt: new Date().toISOString(),
      acceptedMessages: [] as { id: string; threadId: string; sequence: number }[],
      checks: [] as string[],
    };
    try {
      parentContext = await adult.service.signIn(email, password, `HTTP Parent ${runId}`);
      expect(parentContext.role).toBe('parent');
      firstChild = await adult.service.createChild(`HTTP B ${runId}`, '9_11');
      secondChild = await adult.service.createChild(`HTTP C ${runId}`, '6_8');
      expect(firstChild.id).not.toBe(secondChild.id);
      const firstInvite = await adult.service.invite(firstChild.id);
      firstContext = await first.service.enroll(firstInvite.code, `HTTP B device ${runId}`);
      const secondInvite = await adult.service.invite(secondChild.id);
      secondContext = await second.service.enroll(secondInvite.code, `HTTP C device ${runId}`);
      for (const [context, child] of [
        [firstContext, firstChild],
        [secondContext, secondChild],
      ] as const) {
        expect(context).toMatchObject({
          role: 'child',
          personId: child.id,
          householdId: parentContext.householdId,
        });
      }
      expect(await first.service.threads()).toMatchObject([
        { id: firstChild.threadId, kind: 'parent_child', otherRole: 'parent' },
      ]);
      await expect(first.service.messages(secondChild.threadId, {})).rejects.toMatchObject({
        code: 'not_authorized',
      });
      const parentInput = {
        threadId: firstChild.threadId,
        clientKey: randomUUID(),
        body: `Synthetic Parent message ${runId}`,
        phraseId: null,
      };
      const sent = await adult.service.send(parentInput);
      expect(await adult.service.send(parentInput)).toEqual(sent);
      expect(
        (await first.service.messages(firstChild.threadId, {})).filter(
          (item) => item.id === sent.id,
        ),
      ).toHaveLength(1);
      const reply = await first.service.send({
        ...parentInput,
        clientKey: randomUUID(),
        body: `Synthetic Child reply ${runId}`,
      });
      expect(await adult.service.messages(firstChild.threadId, {})).toEqual([sent, reply]);
      receipt.acceptedMessages.push(sent, reply);
      receipt.checks.push(
        'real-parent-login-and-child-enrollment',
        'parent-child-bidirectional',
        'same-key-idempotency',
        'other-parent-thread-denied',
      );

      const pair = () =>
        adult.service
          .peerPermissions()
          .then((pairs) =>
            pairs.find(
              (item) =>
                [item.firstChildId, item.secondChildId].includes(firstChild!.id) &&
                [item.firstChildId, item.secondChildId].includes(secondChild!.id),
            ),
          );
      expect(await pair()).toMatchObject({ enabled: false, available: true, threadId: null });
      await adult.service.setPeerPermission(secondChild.id, firstChild.id, true);
      const peer = await pair();
      if (!peer?.threadId) throw new Error('Expected an explicitly approved peer thread.');
      await adult.service.setPeerPermission(firstChild.id, secondChild.id, true);
      expect((await pair())?.threadId).toBe(peer.threadId);
      for (const child of [first, second])
        expect(
          (await child.service.threads()).some(
            (item) => item.id === peer.threadId && item.kind === 'child_child',
          ),
        ).toBe(true);
      expect((await adult.service.threads()).some((item) => item.id === peer.threadId)).toBe(false);
      await expect(adult.service.messages(peer.threadId, {})).rejects.toMatchObject({
        code: 'not_authorized',
      });
      await expect(
        adult.service.send({ ...parentInput, threadId: peer.threadId, clientKey: randomUUID() }),
      ).rejects.toMatchObject({ code: 'not_authorized' });
      const peerFirst = await first.service.send({
        ...parentInput,
        threadId: peer.threadId,
        clientKey: randomUUID(),
        body: `Synthetic sibling message ${runId}`,
      });
      expect(await second.service.messages(peer.threadId, {})).toEqual([peerFirst]);
      const peerSecond = await second.service.send({
        threadId: peer.threadId,
        clientKey: randomUUID(),
        body: phraseText.en.thanks,
        phraseId: 'thanks',
      });
      expect(await first.service.messages(peer.threadId, {})).toEqual([peerFirst, peerSecond]);
      await expect(
        second.service.send({
          ...parentInput,
          threadId: peer.threadId,
          clientKey: randomUUID(),
          body: 'Uncurated test text',
        }),
      ).rejects.toMatchObject({ code: 'invalid_message' });
      receipt.acceptedMessages.push(peerFirst, peerSecond);
      receipt.checks.push(
        'canonical-peer-permission',
        'peer-bidirectional',
        'parent-peer-content-denied',
        'peer-age-phrase-enforced',
      );

      for (const child of [first, second]) {
        await child.service.leavePeerThread(peer.threadId);
        for (const other of [first, second])
          await expect(other.service.messages(peer.threadId, {})).rejects.toMatchObject({
            code: 'not_authorized',
          });
        await expect(
          child.service.setPeerPermission(firstChild.id, secondChild.id, true),
        ).rejects.toMatchObject({ code: 'not_authorized' });
        expect(await first.service.messages(firstChild.threadId, {})).toEqual([sent, reply]);
        await adult.service.setPeerPermission(firstChild.id, secondChild.id, true);
        expect(await first.service.messages(peer.threadId, {})).toEqual([peerFirst, peerSecond]);
      }
      await adult.service.setPeerPermission(firstChild.id, secondChild.id, false);
      for (const child of [first, second]) {
        await expect(child.service.messages(peer.threadId, {})).rejects.toMatchObject({
          code: 'not_authorized',
        });
        await expect(
          child.service.send({
            threadId: peer.threadId,
            clientKey: randomUUID(),
            body: phraseText.en.help,
            phraseId: 'help',
          }),
        ).rejects.toMatchObject({ code: 'not_authorized' });
      }
      await adult.service.revokeDevice(secondContext.deviceId);
      await expect(second.service.context()).rejects.toMatchObject({ code: 'access_revoked' });
      await expect(second.service.messages(secondChild.threadId, {})).rejects.toMatchObject({
        code: 'access_revoked',
      });
      expect(await first.service.messages(firstChild.threadId, {})).toEqual([sent, reply]);
      receipt.checks.push(
        'either-child-leave',
        'child-cannot-reenable',
        'parent-revocation-denies-read-send',
        'device-revocation',
        'separate-parent-thread-preserved',
      );
      completed = true;
    } finally {
      const cleanup: string[] = [];
      if (parentContext) {
        if (firstChild && secondChild) {
          try {
            await adult.service.setPeerPermission(firstChild.id, secondChild.id, false);
          } catch {
            cleanup.push('peer-disable-unconfirmed');
          }
        }
        const devices = [firstContext?.deviceId, secondContext?.deviceId].filter(
          (id): id is string => Boolean(id),
        );
        for (const id of devices) {
          try {
            await adult.service.revokeDevice(id);
          } catch {
            cleanup.push('test-device-revocation-unconfirmed');
          }
        }
        try {
          const inventory = await adult.service.devices();
          if (devices.some((id) => !inventory.some((device) => device.id === id && !device.active)))
            cleanup.push('test-device-revocation-readback-failed');
        } catch {
          cleanup.push('test-device-readback-unavailable');
        }
      }
      for (const [name, actor] of [
        ['child-b', first],
        ['child-c', second],
        ['parent', adult],
      ] as const) {
        try {
          const result = await actor.service.signOut();
          if (actor.authAccepted() && !actor.logoutAccepted())
            cleanup.push(`${name}-provider-logout-unconfirmed`);
          if (name === 'parent' && parentContext && !result.remoteConfirmed)
            cleanup.push('parent-device-revocation-unconfirmed');
        } catch {
          cleanup.push(`${name}-signout-failed`);
        }
        if (await actor.storage.read()) cleanup.push(`${name}-memory-clear-failed`);
      }
      // Only synthetic receipt fields are emitted; credentials and invitation codes stay in memory.
      console.info(
        JSON.stringify({
          ...receipt,
          acceptedMessages: receipt.acceptedMessages.map(({ id, threadId, sequence }) => ({
            id,
            threadId,
            sequence,
          })),
          completedAt: new Date().toISOString(),
          result: completed && cleanup.length === 0 ? 'PASSED' : 'FAILED',
          cleanup,
          limitations: [
            'synthetic-data-only',
            'no-native-acceptance',
            'no-cron-or-backup-acceptance',
            'test-accounts-and-retained-messages-remain',
          ],
        }),
      );
      if (completed && cleanup.length)
        throw new Error(`Hosted messaging cleanup incomplete: ${cleanup.join(', ')}.`);
    }
  },
  120_000,
);
