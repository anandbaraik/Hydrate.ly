# Development Rules

## General
- Use TypeScript and Vue 3 Composition API (`<script setup lang="ts">`).
- Reuse existing components and services.
- Keep functions small. Do not duplicate logic.
- Do not modify unrelated files.
- Import explicitly. WXT auto-imports are off (ADR-014).

## Before coding
- Read the relevant docs in docs/.
- Inspect the existing implementation.
- Make a plan for large changes.
- Check docs/DECISIONS.md before changing how something works.

## Extension
- Manifest V3 only.
- Never use setInterval or setTimeout for reminders; use chrome.alarms.
- Never play audio from the service worker; use the offscreen document.
- Settings → chrome.storage.sync. Intake logs → chrome.storage.local.
- Do not add permissions beyond: notifications, alarms, storage,
  idle, offscreen.
- No network requests, analytics or remote code. No remote fonts.
- Only services/ may touch chrome.* APIs. Components and stores call
  services.
- Register background listeners synchronously in `defineBackground`.
- Keep pure logic in utils/ so it can be unit tested without a browser.

## UI
- Follow docs/DESIGN.md. Use the theme tokens (`bg-surface`,
  `text-ink-muted`, `rounded-2xl`); no raw hex colours in components.
- Blue (`water`) means water. Primary buttons are ink.
- Draw charts with hand-written SVG; no chart libraries.
- Include empty states.
- Show amounts in the unit the user picked. Store them in ml.
- Real `<button>`, `<input>` and `<label>` elements; icon-only buttons
  need an `aria-label`; everything clickable is at least 44 px tall.

## Testing
- Add tests for important logic.
- Run lint, type check and tests after every change:
  `npm run lint && npm run typecheck && npm test`
- Fix failing tests before continuing.
- Test manually in Chrome and Edge before marking a task done
  (docs/TEST_PLAN.md).

## Git
- Small commits with descriptive messages (`feat:`, `fix:`, `docs:`).
- Work on branches such as `feature/reminders` and `fix/snooze-reschedule`.

## Documentation
- Update TASKS.md and docs/MEMORY.md at the end of every session.
- Record lasting decisions in docs/DECISIONS.md.
