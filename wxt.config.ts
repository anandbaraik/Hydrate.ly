import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// One Manifest V3 build for both Chrome and Edge. See docs/ARCHITECTURE.md.
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  // Explicit imports only: easier to lint, type check and review.
  imports: false,
  manifest: {
    name: 'Hydrate.ly – Water & Break Reminder',
    short_name: 'Hydrate.ly',
    description:
      'Small sips, better focus. Water and break reminders with private, on-device intake tracking.',
    // Keep this list minimal. See docs/SECURITY.md before adding anything.
    permissions: ['notifications', 'alarms', 'storage', 'idle', 'offscreen'],
    minimum_chrome_version: '116',
    action: {
      default_title: 'Hydrate.ly',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
