import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureNativeDirection } from '../../src/i18n';

const native = vi.hoisted(() => ({
  isRTL: true,
  allowRTL: vi.fn(),
  swapLeftAndRightInRTL: vi.fn(),
  forceRTL: vi.fn(),
}));

vi.mock('react-native', () => ({ I18nManager: native }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('native language direction persistence', () => {
  it.each([true, false])(
    'persists the final language after a round trip from startup RTL=%s',
    async (initialRtl) => {
      native.isRTL = initialRtl;
      const initialLocale = initialRtl ? 'ar' : 'en';
      const otherLocale = initialRtl ? 'en' : 'ar';

      expect(await configureNativeDirection(otherLocale)).toBe(true);
      expect(await configureNativeDirection(initialLocale)).toBe(false);

      expect(native.forceRTL).toHaveBeenNthCalledWith(1, !initialRtl);
      expect(native.forceRTL).toHaveBeenLastCalledWith(initialRtl);
      expect(native.isRTL).toBe(initialRtl);
    },
  );
});
