# Security and Privacy Requirements

## Privacy
- No accounts, servers or subscriptions.
- All data stays on the device.
- No network requests, analytics or remote code.
- Fonts, icons and the chime are bundled with the extension.
- No `.env` file and no secrets. If a secret ever appears in the
  codebase, something has gone outside the MVP.

## Permissions (only these)
- Notifications: to show water and break reminders
- Alarms: to schedule reminders
- Storage: to save the goal, logs and settings
- Idle: to auto-pause reminders when you're away
- Offscreen: to play the reminder chime

Keep the permission list minimal. Fewer permissions mean
faster review and more user trust. No host permissions and no content
scripts: the extension never reads or changes web pages.

## Data
- Settings: `chrome.storage.sync`. They sync through the user's own
  browser account, if browser sync is on. Hydrate.ly never sees them.
- Intake logs and pause state: `chrome.storage.local`, on this device
  only. Logs older than 366 days are pruned.

## Input
- Validate custom amounts, intervals and quiet-hour times.
  (`utils/validation.ts`; everything read from storage is sanitized.)
- Escape the custom notification message. It is treated as plain text
  everywhere: control characters are stripped, length is capped at 80,
  Vue escapes it in the UI, and the notification API does not render HTML.
- Never use `v-html`, `innerHTML` or `eval`.

## Review checklist
- [ ] `manifest.json` in the build lists exactly the five permissions
- [ ] No `fetch`, `XMLHttpRequest`, `WebSocket` or remote URLs in the code
- [ ] No remote fonts, scripts or styles in any HTML entrypoint
- [ ] Settings in storage.sync, logs in storage.local
