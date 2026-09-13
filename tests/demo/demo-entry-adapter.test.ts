import { afterEach, describe, expect, it, vi } from 'vitest';

import { DeterministicSyntheticAccessService } from '../../src/features/access';
import { createChildAccessController } from '../../src/features/access/childAccess';
import {
  createCanonicalDemoFamily,
  createDemoEntryAdapter,
  type DemoEntryDependencies,
} from '../../src/features/access/demoEntry';
import { createParentOnboardingController } from '../../src/features/access/parentOnboarding/controller';
import { createInitialParentOnboardingDraft } from '../../src/features/access/parentOnboarding/policy';
import { parseLocalFamilyRecord } from '../../src/features/local-family';
import {
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  type AccessSession,
  type CapabilityAuthorizationInput,
  type ProjectAccessSessionInput,
  type SyntheticChildSignIn,
  type SyntheticParentSignIn,
} from '../../src/models/access';
import type { DemoEntryContext, DemoEntryRequest, DemoPrincipal } from '../../src/models/demoEntry';
import type { DomainResult } from '../../src/models/familyGrowth';
import { LOCAL_FAMILY_STORAGE_KEY } from '../../src/models/localFamily';
import type { ServiceResult } from '../../src/services/interfaces';
import { createMemoryLocalKeyValueStorage } from '../../src/services/local/memoryStorage';
import { createLocalFamilyRepository } from '../../src/services/local/repository';
import { DeterministicRecognitionService, DeterministicTaskService } from '../../src/services/mock';

const NOW = '2026-09-12T08:00:00.000Z';
const PRINCIPALS = ['parent_al_noor', 'child_salem', 'child_alya'] as const;

afterEach(() => vi.restoreAllMocks());

function expectOk<T>(result: DomainResult<T>): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected a successful synthetic operation');
  return result.data;
}

function failure(): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_RESPONSE',
      message: 'Prepared demo entry failure',
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

class FaultAccess extends DeterministicSyntheticAccessService {
  failSecondMarker = false;
  failAuthorization = false;
  failTermination = false;
  throwAfterSignIn = false;
  readonly captured: AccessSession[] = [];

  override restorePairedDevice(
    input: Parameters<DeterministicSyntheticAccessService['restorePairedDevice']>[0],
  ) {
    return this.failSecondMarker && input.childId === 'child_alya'
      ? failure()
      : super.restorePairedDevice(input);
  }

  override signInParent(input: SyntheticParentSignIn) {
    const result = super.signInParent(input);
    if (result.ok) this.captured.push(result.data);
    if (this.throwAfterSignIn) throw new Error('Private injected Parent detail');
    return result;
  }

  override signInChild(input: SyntheticChildSignIn) {
    const result = super.signInChild(input);
    if (result.ok) this.captured.push(result.data);
    if (this.throwAfterSignIn) throw new Error('Private injected Child detail');
    return result;
  }

  override authorizeCapability(input: CapabilityAuthorizationInput) {
    return this.failAuthorization ? failure() : super.authorizeCapability(input);
  }

  override terminateParentSession(input: ProjectAccessSessionInput) {
    return this.failTermination ? failure() : super.terminateParentSession(input);
  }

  override terminateChildSession(input: ProjectAccessSessionInput) {
    return this.failTermination ? failure() : super.terminateChildSession(input);
  }
}

function harness() {
  const access = new FaultAccess();
  const storage = createMemoryLocalKeyValueStorage();
  const family = createLocalFamilyRepository(storage);
  const parent = createParentOnboardingController(access, {
    sessionId: 'demo-adapter-parent',
    deviceId: 'demo-adapter-device',
  });
  const child = createChildAccessController(access, parent);
  const context: { current: DemoEntryContext } = {
    current: {
      mode: 'demo',
      runGeneration: 0,
      entryEpoch: 0,
      activeExperience: 'signed_out',
      activeChildId: 'child_salem',
      temporaryParentAccess: false,
    },
  };
  const parentPort: DemoEntryDependencies['parent'] = {
    getView: () => parent.getView(),
    restoreCompletionReceipt: (receipt) => parent.restoreCompletionReceipt(receipt),
    resumeRememberedParent: (now) => parent.resumeRememberedParent(now),
  };
  const childPort: DemoEntryDependencies['child'] = {
    getView: () => child.getView(),
    restorePairedDevices: (input) => child.restorePairedDevices(input),
    resumeRememberedChild: (childId, now) => child.resumeRememberedChild(childId, now),
  };
  const runAtomically = vi.fn();
  const dependencies: DemoEntryDependencies = {
    family,
    parent: parentPort,
    child: childPort,
    readContext: () => context.current,
    now: () => NOW,
    runAtomically: <T>(operation: () => ServiceResult<T>) => {
      runAtomically();
      return access.withDemoEntryTransaction(() =>
        parent.withDemoEntryTransaction(() => child.withDemoEntryTransaction(operation)),
      );
    },
  };
  const adapter = createDemoEntryAdapter(dependencies);
  const request = (principal: DemoPrincipal = 'parent_al_noor'): DemoEntryRequest => ({
    principal,
    expectedGeneration: context.current.runGeneration,
    expectedEpoch: context.current.entryEpoch,
  });
  const enter = (principal: DemoPrincipal = 'parent_al_noor') => adapter.enter(request(principal));
  const signOut = () => {
    if (parent.getView().status === 'authenticated_parent') expectOk(parent.signOut(NOW));
    if (child.getView().status === 'authenticated_child') expectOk(child.signOut(NOW));
    context.current = {
      ...context.current,
      activeExperience: 'signed_out',
      entryEpoch: context.current.entryEpoch + 1,
    };
  };
  return {
    access,
    storage,
    family,
    parent,
    child,
    parentPort,
    childPort,
    context,
    dependencies,
    adapter,
    request,
    enter,
    signOut,
    runAtomically,
  };
}

function expectNoAuthority(h: ReturnType<typeof harness>) {
  expect(h.parent.getView().status).toBe('signed_out');
  expect(h.child.getView().status).toBe('signed_out');
  expect(h.parent.authorizeParentExperience(NOW).ok).toBe(false);
  expect(h.child.authorizeChildExperience(NOW).ok).toBe(false);
  for (const session of h.access.captured) {
    expect(h.access.projectSession({ session, now: NOW }).ok).toBe(false);
  }
  expect((Reflect.get(h.access, 'sessions') as Map<string, unknown>).size).toBe(0);
}

describe('canonical synthetic demo family', () => {
  it('starts one Arabic household with exactly the Parent, Salem and Alya', () => {
    const result = createCanonicalDemoFamily(NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected the canonical synthetic family');
    expect(result.data).toMatchObject({
      householdId: 'household_al_noor',
      familyName: 'أسرة النور',
      appLanguage: 'ar',
      parent: { id: 'parent_al_noor', role: 'parent' },
      children: [
        { id: 'child_salem', role: 'child', nickname: 'سالم' },
        { id: 'child_alya', role: 'child', nickname: 'علياء' },
      ],
      pairedChildIds: ['child_salem', 'child_alya'],
      origin: 'local_demo',
      capabilityTruth: 'local_prototype_not_authentication',
    });
    expect(result.data.children).toHaveLength(2);
    expect(result.data.familyConnections).toEqual({
      primaryGuardianName: expect.stringMatching(/وليّ? الأمر|الوالد|الوالدة/u),
      secondaryGuardianName: '',
      relatives: [],
    });
    expect(expectOk(parseLocalFamilyRecord(JSON.stringify(result.data)))).toEqual(result.data);
    expect(result.data.createdAt).toBe(NOW);
    expect(result.data.updatedAt).toBe(NOW);
    expect(result.data.children).toEqual(
      createInitialParentOnboardingDraft().children.map(({ profileId, ...child }) => ({
        ...child,
        id: profileId,
        role: 'child',
        nickname: profileId === 'child_alya' ? 'علياء' : 'سالم',
      })),
    );
  });

  it.each(['', 'not a time'])('rejects invalid initialization time %j', (now) => {
    expect(createCanonicalDemoFamily(now).ok).toBe(false);
  });

  it('returns independent records so editing one cannot rename another run', () => {
    const first = expectOk(createCanonicalDemoFamily(NOW));
    const second = expectOk(createCanonicalDemoFamily(NOW));
    Reflect.set(first.children[0]!, 'nickname', 'اسم معدل');
    expect(second.children[0]!.nickname).toBe('سالم');
    expect(expectOk(createCanonicalDemoFamily(NOW))).toEqual(second);
  });
});

describe('demo entry adapter', () => {
  it('constructs without seeding a family or creating authority', () => {
    const h = harness();
    expect(expectOk(h.family.read())).toBeNull();
    expect(h.runAtomically).not.toHaveBeenCalled();
    expectNoAuthority(h);
  });

  it.each(PRINCIPALS)('enters only %s through its real authorized controller', (principal) => {
    const h = harness();
    const parentResume = vi.spyOn(h.parentPort, 'resumeRememberedParent');
    const childResume = vi.spyOn(h.childPort, 'resumeRememberedChild');
    const beforeContext = { ...h.context.current };
    const handoff = expectOk(h.enter(principal));
    expect(handoff).toMatchObject({
      principal,
      destination: principal === 'parent_al_noor' ? '/parent' : '/child',
      activeChildId: principal === 'parent_al_noor' ? 'child_salem' : principal,
      runGeneration: 0,
      entryEpoch: 0,
    });
    expect(handoff.family).toEqual(expectOk(h.family.read()));
    expect(handoff.parentOnboarding).toEqual(h.parent.getView());
    expect(handoff.childAccess).toEqual(h.child.getView());
    expect(h.context.current).toEqual(beforeContext);
    expect(h.runAtomically).toHaveBeenCalledTimes(1);
    expect(parentResume).toHaveBeenCalledTimes(principal === 'parent_al_noor' ? 1 : 0);
    expect(childResume).toHaveBeenCalledTimes(principal === 'parent_al_noor' ? 0 : 1);
    expect(h.parent.authorizeParentExperience(NOW).ok).toBe(principal === 'parent_al_noor');
    expect(h.child.authorizeChildExperience(NOW).ok).toBe(principal !== 'parent_al_noor');
    expect(h.access.captured).toHaveLength(1);
    const session = h.access.captured[0]!;
    expect(expectOk(h.access.projectSession({ session, now: NOW }))).toMatchObject(
      principal === 'parent_al_noor'
        ? { viewKind: 'parent', parentId: principal }
        : { viewKind: 'child', childId: principal },
    );
    expect(
      h.access.authorizeCapability({ session, capability: 'confirm_tasks', now: NOW }).ok,
    ).toBe(principal === 'parent_al_noor');
    expect(handoff).not.toHaveProperty('session');
    expect(handoff).not.toHaveProperty('snapshot');
  });

  it('preserves the current selected Child when the Parent enters', () => {
    const h = harness();
    h.context.current = { ...h.context.current, activeChildId: 'child_alya' };
    expect(expectOk(h.enter()).activeChildId).toBe('child_alya');
  });

  it.each([
    null,
    undefined,
    [],
    {},
    { principal: 'parent' },
    { principal: 'child_unknown', expectedGeneration: 0, expectedEpoch: 0 },
    { principal: 'child_salem', expectedEpoch: 0 },
    { principal: 'child_salem', expectedGeneration: 0 },
    { principal: 'child_salem', expectedGeneration: -1, expectedEpoch: 0 },
    { principal: 'child_salem', expectedGeneration: 0.5, expectedEpoch: 0 },
    { principal: 'child_salem', expectedGeneration: '0', expectedEpoch: 0 },
    { principal: 'child_salem', expectedGeneration: 0, expectedEpoch: -1 },
    { principal: 'child_salem', expectedGeneration: 0, expectedEpoch: NaN },
    { principal: 'child_salem', expectedGeneration: 0, expectedEpoch: Infinity },
    { principal: 'child_salem', expectedGeneration: 0, expectedEpoch: '0' },
    { principal: 'child_salem', expectedGeneration: 0, expectedEpoch: 0, role: 'parent' },
  ])('rejects malformed request %j before seeding or touching authority', (request) => {
    const h = harness();
    expect(h.adapter.enter(request as DemoEntryRequest)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_INPUT' },
    });
    expect(expectOk(h.family.read())).toBeNull();
    expect(h.runAtomically).not.toHaveBeenCalled();
    expectNoAuthority(h);
  });

  it('rejects an accessor request without invoking it or touching authority', () => {
    const h = harness();
    const getter = vi.fn(() => 'parent_al_noor');
    const request = Object.defineProperty(
      { expectedGeneration: 0, expectedEpoch: 0 },
      'principal',
      { enumerable: true, get: getter },
    );
    expect(h.adapter.enter(request as DemoEntryRequest).ok).toBe(false);
    expect(getter).not.toHaveBeenCalled();
    expect(h.runAtomically).not.toHaveBeenCalled();
    expect(expectOk(h.family.read())).toBeNull();
    expectNoAuthority(h);
  });

  it.each([
    { mode: 'ordinary' },
    { runGeneration: 1 },
    { entryEpoch: 1 },
    { runGeneration: -1 },
    { entryEpoch: 0.5 },
    { activeExperience: 'parent' },
    { activeExperience: 'child' },
    { temporaryParentAccess: true },
  ] as const)('rejects unavailable or stale context %j before seeding', (patch) => {
    const h = harness();
    const request = h.request();
    h.context.current = { ...h.context.current, ...patch };
    expect(h.adapter.enter(request).ok).toBe(false);
    expect(expectOk(h.family.read())).toBeNull();
    expect(h.runAtomically).not.toHaveBeenCalled();
    expectNoAuthority(h);
  });

  it.each(['parent_setup', 'child_selection', ...PRINCIPALS] as const)(
    'rejects a signed-out aggregate with an already active %s controller',
    (active) => {
      const h = harness();
      if (active === 'parent_setup') {
        expectOk(h.parent.requestVerification({ identifier: 'parent@example.com' }));
      } else if (active === 'child_selection') {
        expectOk(h.child.selectProfile('child_salem'));
      } else {
        expectOk(h.enter(active));
      }
      const parentBefore = h.parent.getView();
      const childBefore = h.child.getView();
      const familyBefore = h.storage.getItem(LOCAL_FAMILY_STORAGE_KEY);
      const attemptsBefore = h.runAtomically.mock.calls.length;
      expect(h.enter('child_alya').ok).toBe(false);
      expect(h.parent.getView()).toEqual(parentBefore);
      expect(h.child.getView()).toEqual(childBefore);
      expect(h.storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe(familyBefore);
      expect(h.runAtomically).toHaveBeenCalledTimes(attemptsBefore);
    },
  );

  it('does not enter controllers after a failed initial save and permits a valid retry', () => {
    const h = harness();
    const restoreParent = vi.spyOn(h.parentPort, 'restoreCompletionReceipt');
    const restoreChildren = vi.spyOn(h.childPort, 'restorePairedDevices');
    const resumeParent = vi.spyOn(h.parentPort, 'resumeRememberedParent');
    const resumeChild = vi.spyOn(h.childPort, 'resumeRememberedChild');
    h.storage.failNextWrite();
    expect(h.enter().ok).toBe(false);
    expect(h.runAtomically).not.toHaveBeenCalled();
    for (const operation of [restoreParent, restoreChildren, resumeParent, resumeChild]) {
      expect(operation).not.toHaveBeenCalled();
    }
    expect(expectOk(h.family.read())).toBeNull();
    expectNoAuthority(h);
    expectOk(h.enter());
  });

  it('rolls back the first marker after a second-marker failure and retries both markers', () => {
    const h = harness();
    const beforeParent = h.parent.getView();
    const beforeChild = h.child.getView();
    h.access.failSecondMarker = true;
    expect(h.enter('child_salem').ok).toBe(false);
    expect(h.parent.getView()).toEqual(beforeParent);
    expect(h.child.getView()).toEqual(beforeChild);
    expectNoAuthority(h);
    expect(expectOk(h.family.read())).not.toBeNull();
    expect(
      h.access.signInChild({
        childId: 'child_salem',
        childCredentialFixtureId: SYNTHETIC_CHILD_CREDENTIAL_FIXTURES.child_salem.fixtureId,
        deviceId: 'r003-shared-device-child_salem',
        sessionId: 'orphan-marker-probe',
        now: NOW,
      }).ok,
    ).toBe(false);
    expect((Reflect.get(h.access, 'devices') as Map<string, unknown>).size).toBe(0);
    h.access.failSecondMarker = false;
    expectOk(h.enter('child_alya'));
    expect(h.child.getView().pairedDevices.map((device) => device.childId)).toEqual([
      'child_salem',
      'child_alya',
    ]);
    expectOk(h.child.authorizeChildExperience(NOW));
  });

  it.each(PRINCIPALS)(
    'rolls back %s when authorization and termination both fail, then permits retry',
    (principal) => {
      const h = harness();
      const beforeParent = h.parent.getView();
      const beforeChild = h.child.getView();
      h.access.failAuthorization = true;
      h.access.failTermination = true;
      expect(h.enter(principal).ok).toBe(false);
      expect(h.access.captured).toHaveLength(1);
      expect(h.parent.getView()).toEqual(beforeParent);
      expect(h.child.getView()).toEqual(beforeChild);
      expectNoAuthority(h);
      h.access.failAuthorization = false;
      h.access.failTermination = false;
      expectOk(h.enter(principal));
      expectOk(h.access.projectSession({ session: h.access.captured.at(-1)!, now: NOW }));
    },
  );

  it.each(PRINCIPALS)('sanitizes a throw after %s session creation and retries', (principal) => {
    const h = harness();
    h.access.throwAfterSignIn = true;
    const result = h.enter(principal);
    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_RESPONSE' } });
    expect(JSON.stringify(result)).not.toContain('Private injected');
    expectNoAuthority(h);
    h.access.throwAfterSignIn = false;
    expectOk(h.enter(principal));
  });

  it.each([
    'missing',
    'one_child',
    'wrong_parent',
    'unpaired_child',
    'wrong_identifier',
    'replacement',
  ] as const)(
    'rejects an initialized generation with a %s family without repairing it',
    (fault) => {
      const h = harness();
      expectOk(h.enter());
      h.signOut();
      const record = expectOk(h.family.read())!;
      if (fault === 'missing') h.storage.removeItem(LOCAL_FAMILY_STORAGE_KEY);
      else {
        h.storage.setItem(
          LOCAL_FAMILY_STORAGE_KEY,
          JSON.stringify(
            fault === 'one_child'
              ? {
                  ...record,
                  children: record.children.slice(0, 1),
                  pairedChildIds: ['child_salem'],
                }
              : fault === 'wrong_parent'
                ? { ...record, parent: { ...record.parent, id: 'parent_other' } }
                : fault === 'unpaired_child'
                  ? { ...record, pairedChildIds: ['child_salem'] }
                  : fault === 'wrong_identifier'
                    ? {
                        ...record,
                        parent: { ...record.parent, normalizedIdentifier: 'other@example.com' },
                      }
                    : { ...record, createdAt: '2026-09-11T08:00:00.000Z' },
          ),
        );
      }
      const before = h.storage.getItem(LOCAL_FAMILY_STORAGE_KEY);
      const write = vi.spyOn(h.family, 'save');
      expect(h.enter('child_alya').ok).toBe(false);
      expect(h.storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe(before);
      expect(write).not.toHaveBeenCalled();
      expectNoAuthority(h);
      expectOk(h.family.save(record));
      expectOk(h.enter('child_alya'));
    },
  );

  it.each([
    'generation',
    'epoch',
    'aggregate',
    'temporary',
    'selected_child',
    'invalidate',
    'reentry',
  ] as const)(
    'aborts and rolls back when %s changes inside the selected resume callback',
    (interruption) => {
      const h = harness();
      const original = h.parent.resumeRememberedParent.bind(h.parent);
      const initialContext = { ...h.context.current };
      vi.spyOn(h.parentPort, 'resumeRememberedParent').mockImplementationOnce((now) => {
        const entered = original(now);
        expectOk(entered);
        if (interruption === 'generation') {
          h.context.current = { ...h.context.current, runGeneration: 1 };
        } else if (interruption === 'epoch') {
          h.context.current = { ...h.context.current, entryEpoch: 1 };
        } else if (interruption === 'aggregate') {
          h.context.current = { ...h.context.current, activeExperience: 'child' };
        } else if (interruption === 'temporary') {
          h.context.current = { ...h.context.current, temporaryParentAccess: true };
        } else if (interruption === 'selected_child') {
          Reflect.set(h.context.current, 'activeChildId', 'child_alya');
        } else if (interruption === 'invalidate') h.adapter.invalidate();
        else expect(h.enter('child_alya').ok).toBe(false);
        return entered;
      });
      expect(h.enter().ok).toBe(false);
      expectNoAuthority(h);
      h.context.current = initialContext;
      expectOk(h.enter());
    },
  );

  it('rejects a successful resume result that did not create Parent authority', () => {
    const h = harness();
    vi.spyOn(h.parentPort, 'resumeRememberedParent').mockReturnValueOnce({
      ok: true,
      data: {
        authorized: true,
        capability: 'enter_parent_experience',
        destination: '/parent',
        receiptId: 'parent_onboarding_al_noor_r001_v1',
        origin: 'synthetic',
      },
      meta: { origin: 'synthetic', fallbackUsed: false },
    });
    expect(h.enter().ok).toBe(false);
    expectNoAuthority(h);
    expectOk(h.enter());
  });

  it('rejects a callback that authenticates both controllers', () => {
    const h = harness();
    const original = h.parent.resumeRememberedParent.bind(h.parent);
    vi.spyOn(h.parentPort, 'resumeRememberedParent').mockImplementationOnce((now) => {
      const entered = original(now);
      expectOk(entered);
      expectOk(h.child.resumeRememberedChild('child_salem', now));
      return entered;
    });
    expect(h.enter().ok).toBe(false);
    expectNoAuthority(h);
    expectOk(h.enter());
  });

  it('rejects a callback that authenticates Alya for a Salem request', () => {
    const h = harness();
    vi.spyOn(h.childPort, 'resumeRememberedChild').mockImplementationOnce((_childId, now) =>
      h.child.resumeRememberedChild('child_alya', now),
    );
    expect(h.enter('child_salem').ok).toBe(false);
    expectNoAuthority(h);
    expectOk(h.enter('child_salem'));
  });

  it('invalidates old captured generation and epoch requests after a new run', () => {
    const h = harness();
    const stale = h.request('child_salem');
    h.adapter.invalidate();
    h.context.current = { ...h.context.current, runGeneration: 1, entryEpoch: 2 };
    expect(h.adapter.enter(stale).ok).toBe(false);
    expectNoAuthority(h);
    expect(expectOk(h.family.read())).toBeNull();
    expect(expectOk(h.enter('child_salem'))).toMatchObject({ runGeneration: 1, entryEpoch: 2 });
  });

  it('captures the requested principal and counters before a callback mutates its input', () => {
    const h = harness();
    const request = h.request('child_salem');
    const read = h.family.read.bind(h.family);
    vi.spyOn(h.family, 'read').mockImplementationOnce(() => {
      Reflect.set(request, 'principal', 'child_alya');
      Reflect.set(request, 'expectedGeneration', 99);
      Reflect.set(request, 'expectedEpoch', 99);
      return read();
    });
    expect(expectOk(h.adapter.enter(request))).toMatchObject({
      principal: 'child_salem',
      activeChildId: 'child_salem',
      runGeneration: 0,
      entryEpoch: 0,
    });
    expect(
      expectOk(h.access.projectSession({ session: h.access.captured[0]!, now: NOW })),
    ).toMatchObject({ viewKind: 'child', childId: 'child_salem' });
  });

  it('ends old authority at sign-out and gives Alya only her own profile authority', () => {
    const h = harness();
    expectOk(h.enter('child_salem'));
    const salemSession = h.access.captured[0]!;
    const staleRequest = h.request('child_salem');
    h.signOut();
    expect(h.adapter.enter(staleRequest).ok).toBe(false);
    expectOk(h.enter('child_alya'));
    const alyaSession = h.access.captured.at(-1)!;
    expect(h.access.projectSession({ session: salemSession, now: NOW }).ok).toBe(false);
    expect(expectOk(h.access.projectSession({ session: alyaSession, now: NOW }))).toMatchObject({
      viewKind: 'child',
      childId: 'child_alya',
    });
    expectOk(
      h.access.getChildPermissions({ session: alyaSession, childId: 'child_alya', now: NOW }),
    );
    expect(
      h.access.getChildPermissions({ session: alyaSession, childId: 'child_salem', now: NOW }).ok,
    ).toBe(false);
    expect(
      h.access.authorizeCapability({
        session: alyaSession,
        capability: 'confirm_tasks',
        now: NOW,
      }).ok,
    ).toBe(false);
  });

  it('retains profile edits and separate progress through repeated same-run handoffs', () => {
    const h = harness();
    const seed = vi.spyOn(h.family, 'save');
    const parentRestore = vi.spyOn(h.parentPort, 'restoreCompletionReceipt');
    const childRestore = vi.spyOn(h.childPort, 'restorePairedDevices');
    expectOk(h.enter());
    expect(seed).toHaveBeenCalledTimes(1);
    h.signOut();
    const family = expectOk(h.family.read())!;
    const edited = expectOk(
      h.family.save({
        ...family,
        familyName: 'Al Noor Family',
        appLanguage: 'en',
        children: family.children.map((child) =>
          child.id === 'child_alya'
            ? { ...child, nickname: 'Alya', supportPreferences: ['extra_time'] }
            : child,
        ),
      }),
    );
    const progressKey = 'test-only-independent-demo-progress';
    const progress = JSON.stringify({
      lifetimeSeeds: { child_salem: 73, child_alya: 29 },
      landscapeSeeds: 61,
      confirmedChallengeLeaves: 2,
      rewardEligibleSeeds: 113,
      recognitionIds: ['existing-recognition-sentinel'],
      permissions: { voice: false, media: false, ai: false },
    });
    h.storage.setItem(progressKey, progress);
    for (const principal of ['child_salem', 'child_alya', 'parent_al_noor'] as const) {
      expect(expectOk(h.enter(principal)).family).toEqual(edited);
      expect(h.storage.getItem(progressKey)).toBe(progress);
      h.signOut();
    }
    expect(seed).toHaveBeenCalledTimes(2);
    expect(parentRestore).toHaveBeenCalledTimes(1);
    expect(childRestore).toHaveBeenCalledTimes(1);
    expect(expectOk(h.family.read())).toEqual(edited);
    expectNoAuthority(h);
  });

  it('preserves an initialized run and Parent-granted permission across failure and retry', () => {
    const h = harness();
    expectOk(h.enter());
    expectOk(
      h.parent.updateChildPermission({
        childId: 'child_salem',
        change: { kind: 'voice', granted: true },
        proofId: 'existing-voice-grant',
        reauthenticationCode: '4242',
        now: NOW,
      }),
    );
    h.signOut();
    const familyBefore = h.storage.getItem(LOCAL_FAMILY_STORAGE_KEY);
    const childBefore = h.child.getView();
    const parentBefore = h.parent.getView();
    const grantsBefore = structuredClone(Reflect.get(h.access, 'permissionGrants'));
    const seed = vi.spyOn(h.family, 'save');
    const restore = vi.spyOn(h.childPort, 'restorePairedDevices');
    h.access.failAuthorization = true;
    h.access.failTermination = true;
    expect(h.enter('child_salem').ok).toBe(false);
    expectNoAuthority(h);
    expect(h.parent.getView()).toEqual(parentBefore);
    expect(h.child.getView()).toEqual(childBefore);
    expect(h.storage.getItem(LOCAL_FAMILY_STORAGE_KEY)).toBe(familyBefore);
    expect(Reflect.get(h.access, 'permissionGrants')).toEqual(grantsBefore);
    h.access.failAuthorization = false;
    h.access.failTermination = false;
    expectOk(h.enter('child_salem'));
    expect(expectOk(h.child.getOwnPermissions(NOW))).toMatchObject({ voiceGranted: true });
    expect(seed).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
  });

  it('calls no verification, pairing approval, permission, or reset API on any entry', () => {
    const h = harness();
    const forbidden = [
      vi.spyOn(h.parent, 'requestVerification'),
      vi.spyOn(h.parent, 'verifyCode'),
      vi.spyOn(h.parent, 'complete'),
      vi.spyOn(h.child, 'verifyCredential'),
      vi.spyOn(h.child, 'requestPairing'),
      vi.spyOn(h.child, 'approvePairing'),
      vi.spyOn(h.child, 'completePairing'),
      vi.spyOn(h.child, 'reset'),
      vi.spyOn(h.access, 'requestPairing'),
      vi.spyOn(h.access, 'approvePairing'),
      vi.spyOn(h.access, 'consumePairing'),
      vi.spyOn(h.access, 'getChildPermissions'),
      vi.spyOn(h.access, 'updateChildPermissions'),
      vi.spyOn(h.access, 'resetPrototype'),
      vi.spyOn(DeterministicTaskService.prototype, 'approveAssignment'),
      vi.spyOn(DeterministicRecognitionService.prototype, 'applyRecognition'),
    ];
    const permissionsBefore = structuredClone(Reflect.get(h.access, 'permissionGrants'));
    for (const principal of PRINCIPALS) {
      expectOk(h.enter(principal));
      expect(Reflect.get(h.access, 'permissionGrants')).toEqual(permissionsBefore);
      h.signOut();
    }
    forbidden.forEach((operation) => expect(operation).not.toHaveBeenCalled());
  });
});
