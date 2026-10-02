# Tasks

Work through one task at a time: implement → test → review → mark
complete → next. Update `docs/MEMORY.md` at the end of every session.

`[x]` means implemented, covered by automated checks (lint, type check,
unit tests, build) and exercised once in headless Chromium. It does not
mean the manual pass in Chrome and Edge is done: that is Phase 8.

## Phase 1: Setup
- [x] TASK-001 Scaffold WXT project with Vue 3 + TypeScript
- [x] TASK-002 Configure Tailwind, lint and type check
- [x] TASK-003 Declare permissions in the manifest
- [x] TASK-004 Create storage service (sync for settings, local for logs)

## Phase 2: Water reminders
- [x] TASK-005 Schedule water reminders with chrome.alarms
- [x] TASK-006 Show notification with custom message
- [x] TASK-007 Add Snooze and "I drank" notification buttons
- [x] TASK-008 Persistent vs banner-style option
- [x] TASK-009 Optional chime via offscreen document

## Phase 3: Intake tracking
- [x] TASK-010 Quick log: 250 ml, 500 ml, custom
- [x] TASK-011 Progress ring (SVG) with daily goal
- [x] TASK-012 ml / oz toggle

## Phase 4: Break reminders
- [x] TASK-013 20-20-20 eye rule reminders
- [x] TASK-014 Pomodoro-style intervals

## Phase 5: Focus-friendly
- [x] TASK-015 Quiet hours
- [x] TASK-016 One-click pause (30 min, 1 hour, until tomorrow)
- [x] TASK-017 Auto-pause with chrome.idle

## Phase 6: History
- [x] TASK-018 7-day bar chart (SVG)
- [x] TASK-019 Daily average and streak

## Phase 7: Settings and release
- [x] TASK-020 Options page with all settings
- [x] TASK-021 Focus Assist / Do Not Disturb note on Windows
- [ ] TASK-022 Store listing assets and production zip
  - [x] Extension icons (16, 32, 48, 96, 128) and notification icons
  - [x] `npm run zip` produces `.output/hydrately-1.0.0-chrome.zip`
  - [ ] Store screenshots (1280×800) of Today, History and Settings
  - [ ] Store description, category and privacy statement
  - [ ] Small promo tile (440×280) for the Chrome Web Store

## Phase 8: QA and publish
- [ ] TASK-023 Load unpacked in Chrome; run docs/TEST_PLAN.md
- [ ] TASK-024 Load unpacked in Edge; run docs/TEST_PLAN.md
- [ ] TASK-025 Listen to the chime on real speakers; adjust
      `scripts/generate-assets.mjs` if it is too loud or too quiet
- [ ] TASK-026 Check a real notification on Windows and macOS: both
      buttons, banner vs persistent, Focus Assist / Do Not Disturb
- [ ] TASK-027 Leave the browser idle until the service worker sleeps;
      confirm the next reminder still fires
- [ ] TASK-028 Privacy and permissions review against docs/SECURITY.md
- [x] TASK-029 Code review against PRD, ARCHITECTURE, DESIGN, RULES
      (done 2 Oct 2026; fixes applied, follow-ups are in Phase 9)
- [ ] TASK-030 Commit and push; create branches for further work
- [ ] TASK-031 Submit to the Chrome Web Store and Edge Add-ons
- [ ] TASK-032 Install the published version from each store and
      re-run the test plan

## Phase 9: Code review follow-ups
From the review on 2 Oct 2026. Already fixed: "until tomorrow" after
midnight, lost writes, the 100% label, Pomodoro rounds while paused,
popup error handling, emoji cut in the message, and the focus ring,
`h1`, slider name, quiet-hours group and log announcement.

Before the store listing:
- [ ] TASK-033 Reword the privacy line. Settings sync through the
      browser account, so "Everything stays on this device" is not
      strictly true. Suggested: "No account, no servers. Your log stays
      on this device." Update `SettingsForm.vue`, README.md and the
      store description together (ADR-026).
- [ ] TASK-034 Confirm on real Windows and macOS whether the chime plays
      while Focus Assist / Do Not Disturb hides the notification, and
      adjust the settings note if it does not (ADR-022).

Behaviour:
- [ ] TASK-035 Judge the streak against each day's own goal. Today a
      goal change re-judges every past day, so raising the goal can
      reset the streak (ADR-025). Needs the day's goal stored with the
      log.
- [ ] TASK-036 Refresh the popup while it is open: a pause that expires,
      a countdown that elapses and midnight rollover all stay stale
      until it is reopened. No timers for reminders; a display-only
      refresh needs a decision first.

Accessibility and design:
- [ ] TASK-037 Raise three graphic colours to 3:1 in the design system,
      then in `assets/styles/main.css`: input borders (`line-strong`,
      1.37:1), missed-day bars (`water-soft`, 1.42:1) and the ring
      (`water` on `bg`, 2.92:1). Dark theme: 1.60:1 and 1.74:1.

Code and docs consistency:
- [ ] TASK-038 `entrypoints/background.ts` calls `browser.runtime`
      directly. Move `onInstalled` / `onStartup` behind a service, or
      say in ARCHITECTURE.md that the background script may register
      lifecycle listeners itself.
- [ ] TASK-039 Remove duplication: the reminder id maps and `kindOf` in
      `services/alarms.ts` and `services/notifications.ts`; the two
      identical `main.ts` files; the repeated chip classes in
      `SettingsForm.vue` (and split that 300-line component); the two
      near-identical rows in `UpNextCard.vue`; today's total summed in
      both `services/reminders.ts` and `stores/intake.ts`; the
      pass-through `SettingsView.vue`.
- [ ] TASK-040 Add tests for the Pinia stores (optimistic update and
      revert, undo, pause and resume) and for key components.
- [ ] TASK-041 From here on, commit in small steps on feature branches
      instead of one large uncommitted change.

## Later (not in the MVP)
Ideas only. Check docs/PRD.md "Out of scope" before starting any.
- Keyboard shortcut to log a drink
- Editable quick-add amounts
- Export the intake log as CSV
- Playwright end-to-end tests for the popup
