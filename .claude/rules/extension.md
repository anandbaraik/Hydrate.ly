---
paths:
  - "entrypoints/**"
  - "services/**"
  - "stores/**"
  - "wxt.config.ts"
---

# Extension rules

Platform rules for alarms, storage, permissions and privacy.

- Manifest V3 only.
- Never use `setInterval` or `setTimeout` for reminders; use `chrome.alarms` through `services/alarms.ts`.
- Never play audio from the service worker; use the offscreen document (`services/chime.ts`).
- Settings go to `chrome.storage.sync`. Intake logs and device state go to `chrome.storage.local`.
- Every storage write is read-modify-write: keep it inside `exclusive()` in `services/storage.ts`.
- Only `services/` may touch `chrome.*` / `browser.*`. Components and stores call services.
- Register background listeners synchronously inside `defineBackground`.
- Do not add permissions beyond: notifications, alarms, storage, idle, offscreen.
- No network requests, analytics, remote code or remote fonts.
- Validate everything read from storage with `utils/validation.ts`.
