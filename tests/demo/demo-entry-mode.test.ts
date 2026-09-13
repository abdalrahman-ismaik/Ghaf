import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('build-selected demo entry', () => {
  it.each([undefined, '', 'false', 'TRUE', '1', ' true '])(
    'keeps ordinary access for %s',
    async (value) => {
      vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', value);
      vi.resetModules();
      expect((await import('../../src/config/demoEntry')).entryMode).toBe('ordinary');
    },
  );

  it('selects demo only for the exact build value and remains fixed for the run', async () => {
    vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', 'true');
    vi.resetModules();
    const config = await import('../../src/config/demoEntry');
    expect(config.entryMode).toBe('demo');
    vi.stubEnv('EXPO_PUBLIC_GHAF_DEMO_ENTRY', 'false');
    expect(config.entryMode).toBe('demo');
  });
});
