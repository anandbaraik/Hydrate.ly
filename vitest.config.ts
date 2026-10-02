import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

// WxtVitest swaps `wxt/browser` for an in-memory fake, so services can be
// tested without a real browser.
export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    include: ['tests/**/*.test.ts'],
    mockReset: true,
    restoreMocks: true,
  },
});
