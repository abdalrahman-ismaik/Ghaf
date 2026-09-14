import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    clearMocks: true,
    // The historical fixture suite explicitly selects the isolated demonstration.
    env: { EXPO_PUBLIC_GHAF_AUTH_MODE: 'demo' },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
