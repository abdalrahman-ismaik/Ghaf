import { describe, expect, it, vi } from 'vitest';
import {
  SupabaseFamilyMessagingService,
  readMessagingConfig,
} from '../../src/features/familyMessaging/client';
import { deferred, ids, memoryStorage, message, parent } from './fixtures';
import { createCredentialStorage } from '../../src/features/familyMessaging/credentialStorage';

const config = {
  url: 'https://synthetic.invalid',
  publishableKey: 'sb_publishable_synthetic_test',
};
const auth = {
  access_token: 'test-access',
  refresh_token: 'test-refresh',
  expires_in: 3600,
  user: { id: ids.user },
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const input = { threadId: ids.thread, clientKey: ids.key, body: message.body, phraseId: null };
function client(fetcher = vi.fn<typeof fetch>()) {
  const storage = memoryStorage();
  const service = new SupabaseFamilyMessagingService(config, storage, fetcher, () => 0, 50);
  return { service, storage, fetcher };
}
async function signedIn(fetcher = vi.fn<typeof fetch>()) {
  const result = client(fetcher);
  fetcher.mockResolvedValueOnce(response(auth)).mockResolvedValueOnce(response(parent));
  await result.service.signIn('synthetic@example.invalid', 'synthetic-password', 'Test device');
  return result;
}

describe('real messaging Auth and transport boundary', () => {
  it('normalizes an uppercase typed or pasted hexadecimal enrollment code', async () => {
    const { service, fetcher } = client();
    fetcher.mockResolvedValueOnce(response(auth)).mockResolvedValueOnce(response(parent));
    await service.enroll(' ABCDEF0123456789ABCDEF0123456789 ', 'Child phone');
    const request = fetcher.mock.calls.at(-1);
    expect(request?.[0]).toBe(`${config.url}/rest/v1/rpc/fm_enroll`);
    expect(JSON.parse(String(request?.[1]?.body))).toMatchObject({
      p_code: 'abcdef0123456789abcdef0123456789',
    });
  });
  it('accepts only public HTTPS configuration without credentials or URL paths', () => {
    expect(readMessagingConfig(config.url, config.publishableKey)).toEqual(config);
    for (const url of [
      'http://local.invalid',
      'https://u:p@synthetic.invalid',
      'https://synthetic.invalid/path',
      'https://synthetic.invalid/?secret=1',
    ]) {
      expect(readMessagingConfig(url, config.publishableKey)).toBeNull();
    }
    expect(readMessagingConfig(config.url, 'sb_secret_not_allowed')).toBeNull();
  });

  it('maps malformed successful sends and server failures to unknown', async () => {
    const { service, fetcher } = await signedIn();
    fetcher.mockResolvedValueOnce(response({ ok: true }));
    await expect(service.send(input)).rejects.toMatchObject({ code: 'unknown' });
    fetcher.mockResolvedValueOnce(response({ code: 'service_unavailable' }, 503));
    await expect(service.send(input)).rejects.toMatchObject({ code: 'unknown' });
  });

  it('posts only plain message fields to the exact RPC and preserves accepted records', async () => {
    const { service, fetcher } = await signedIn();
    fetcher.mockResolvedValueOnce(response(message));
    expect(await service.send(input)).toEqual(message);
    const [url, request] = fetcher.mock.calls.at(-1)!;
    expect(url).toBe(`${config.url}/rest/v1/rpc/fm_send`);
    expect(JSON.parse(String(request?.body))).toEqual({
      p_thread_id: ids.thread,
      p_client_key: ids.key,
      p_body: message.body,
      p_phrase_id: null,
    });
    expect(request?.cache).toBe('no-store');
  });

  it('keeps definitive safe rejection and never exposes raw SQL errors', async () => {
    const { service, fetcher } = await signedIn();
    fetcher.mockResolvedValueOnce(
      response({ code: 'access_revoked', message: 'access_revoked' }, 403),
    );
    await expect(service.send(input)).rejects.toMatchObject({ code: 'access_revoked' });
    fetcher.mockResolvedValueOnce(
      response({ code: '22P02', message: 'raw SQL includes private input' }, 400),
    );
    await expect(service.send(input)).rejects.toMatchObject({
      code: 'invalid_request',
      message: 'invalid_request',
    });
  });

  it('classifies an aborted submitted send conservatively as unknown', async () => {
    const { service, fetcher } = await signedIn();
    fetcher.mockImplementationOnce(
      async (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('network abort')), {
            once: true,
          });
        }),
    );
    await expect(service.send(input)).rejects.toMatchObject({ code: 'unknown' });
  });

  it('invalidates in-flight login immediately when signing out', async () => {
    const { service, fetcher, storage } = client();
    const lateAuth = deferred<Response>();
    fetcher.mockReturnValueOnce(lateAuth.promise);
    const login = service.signIn('synthetic@example.invalid', 'synthetic-password', 'Test device');
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await service.signOut();
    lateAuth.resolve(response(auth));
    await expect(login).rejects.toMatchObject({ code: 'not_authenticated' });
    expect(await storage.read()).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('only the newest of overlapping login attempts may reach provider authentication', async () => {
    const { service, fetcher, storage } = client();
    const clearing = deferred<void>();
    vi.mocked(storage.clear).mockReturnValueOnce(clearing.promise);
    fetcher.mockResolvedValueOnce(response(auth)).mockResolvedValueOnce(response(parent));
    const first = service.signIn('first@example.invalid', 'synthetic-password', 'First');
    const firstResult = first.catch((error: unknown) => error);
    const second = service.signIn('second@example.invalid', 'synthetic-password', 'Second');
    clearing.resolve();
    expect(await firstResult).toMatchObject({ code: 'not_authenticated' });
    await second;
    const authCalls = fetcher.mock.calls.filter(([url]) =>
      String(url).includes('grant_type=password'),
    );
    expect(authCalls).toHaveLength(1);
    expect(JSON.parse(String(authCalls[0]?.[1]?.body)).email).toBe('second@example.invalid');
  });

  it('attempts provider local logout even when device revocation fails', async () => {
    const { service, fetcher, storage } = await signedIn();
    fetcher.mockImplementation(async (url) => {
      if (String(url).endsWith('/auth/v1/user')) return response({ id: ids.user });
      if (String(url).endsWith('/fm_context')) return response(parent);
      if (String(url).endsWith('/fm_revoke_device'))
        return response({ code: 'service_unavailable' }, 503);
      if (String(url).includes('/auth/v1/logout')) return new Response(null, { status: 204 });
      throw new Error('Unexpected test endpoint');
    });
    expect(await service.signOut()).toEqual({ remoteConfirmed: false });
    expect(
      fetcher.mock.calls.some(([url]) => String(url).includes('/auth/v1/logout?scope=local')),
    ).toBe(true);
    expect(await storage.read()).toBeNull();
  });

  it('reuses the genuine anonymous session for an explicit enrollment retry', async () => {
    const { service, fetcher } = client();
    fetcher
      .mockResolvedValueOnce(response(auth))
      .mockResolvedValueOnce(response({ code: 'invalid_invite' }, 400));
    await expect(service.enroll('wrong', 'Test Child')).rejects.toMatchObject({
      code: 'invalid_invite',
    });
    fetcher.mockResolvedValueOnce(response({ code: 'invalid_invite' }, 400));
    await expect(service.enroll('retry', 'Test Child')).rejects.toMatchObject({
      code: 'invalid_invite',
    });
    expect(
      fetcher.mock.calls.filter(([url]) => String(url).endsWith('/auth/v1/signup')),
    ).toHaveLength(1);
  });

  it('fails closed when secure credential writes fail', async () => {
    const { service, fetcher, storage } = client();
    vi.mocked(storage.write).mockRejectedValue(new Error('secure storage unavailable'));
    fetcher.mockResolvedValueOnce(response(auth));
    await expect(
      service.signIn('synthetic@example.invalid', 'synthetic-password', 'Test'),
    ).rejects.toMatchObject({ code: 'storage_failed' });
    await expect(service.context()).rejects.toMatchObject({ code: 'not_authenticated' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('serializes concurrent refresh and rejects its late completion after forgetting', async () => {
    let now = 0;
    const fetcher = vi.fn<typeof fetch>();
    const storage = memoryStorage();
    const service = new SupabaseFamilyMessagingService(config, storage, fetcher, () => now);
    fetcher.mockResolvedValueOnce(response(auth)).mockResolvedValueOnce(response(parent));
    await service.signIn('synthetic@example.invalid', 'synthetic-password', 'Test');
    now = 3_550_000;
    const refresh = deferred<Response>();
    fetcher.mockReturnValueOnce(refresh.promise);
    const first = service.messages(ids.thread, {}).catch((error: unknown) => error);
    const second = service.threads().catch((error: unknown) => error);
    await vi.waitFor(() =>
      expect(
        fetcher.mock.calls.filter(([url]) => String(url).includes('grant_type=refresh_token')),
      ).toHaveLength(1),
    );
    await service.forget();
    refresh.resolve(response(auth));
    expect(await first).toMatchObject({ code: 'not_authenticated' });
    expect(await second).toMatchObject({ code: 'not_authenticated' });
    expect(await storage.read()).toBeNull();
  });

  it('does not let a failed old credential write erase a newer login', async () => {
    const { service, storage, fetcher } = client();
    const oldWrite = deferred<void>();
    vi.mocked(storage.write).mockReturnValueOnce(oldWrite.promise);
    fetcher.mockResolvedValueOnce(response(auth));
    const first = service
      .signIn('old@example.invalid', 'synthetic-password', 'Old')
      .catch((error: unknown) => error);
    await vi.waitFor(() => expect(storage.write).toHaveBeenCalledTimes(1));
    fetcher.mockResolvedValueOnce(response(auth)).mockResolvedValueOnce(response(parent));
    const second = service.signIn('new@example.invalid', 'synthetic-password', 'New');
    oldWrite.reject(new Error('Old secure write failed'));
    expect(await first).toMatchObject({ code: 'not_authenticated' });
    await second;
    fetcher
      .mockResolvedValueOnce(response({ id: ids.user }))
      .mockResolvedValueOnce(response(parent));
    expect(await service.context()).toEqual(parent);
    expect(await storage.read()).not.toBeNull();
  });

  it('shares one anonymous signup across concurrent enrollment calls', async () => {
    const { service, fetcher } = client();
    const signup = deferred<Response>();
    fetcher.mockReturnValueOnce(signup.promise);
    const first = service.enroll('one', 'Test').catch((error: unknown) => error);
    const second = service.enroll('two', 'Test').catch((error: unknown) => error);
    fetcher.mockImplementation(async () => response({ code: 'invalid_invite' }, 400));
    signup.resolve(response(auth));
    expect(await first).toMatchObject({ code: 'invalid_invite' });
    expect(await second).toMatchObject({ code: 'invalid_invite' });
    expect(
      fetcher.mock.calls.filter(([url]) => String(url).endsWith('/auth/v1/signup')),
    ).toHaveLength(1);
  });

  it('keeps browser credentials in its current instance only', async () => {
    const current = createCredentialStorage();
    await current.write('Synthetic tab credential');
    expect(await current.read()).toBe('Synthetic tab credential');
    expect(await createCredentialStorage().read()).toBeNull();
    await current.clear();
    expect(await current.read()).toBeNull();
  });

  it('clears malformed or foreign-endpoint stored credentials before any network request', async () => {
    const { service, storage, fetcher } = client();
    await storage.write(
      JSON.stringify({
        version: 1,
        endpoint: 'https://other.invalid',
        session: { ...auth, expires_at: 3600 },
      }),
    );
    expect(await service.restore()).toBeNull();
    expect(await storage.read()).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('waits for a pending credential clear before restoring a session', async () => {
    const { service, storage, fetcher } = await signedIn();
    const clearing = deferred<void>();
    const originalClear = storage.clear;
    vi.mocked(storage.clear).mockImplementationOnce(async () => {
      await clearing.promise;
      await originalClear();
    });
    const forgetting = service.forget();
    const restoring = service.restore();
    await Promise.resolve();
    expect(fetcher).toHaveBeenCalledTimes(2);
    clearing.resolve();
    await forgetting;
    expect(await restoring).toBeNull();
  });
});
