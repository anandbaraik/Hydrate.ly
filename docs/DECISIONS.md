# Architecture Decisions

Permanent decisions. Do not undo one without adding a new ADR that says why.

## ADR-001: Chrome and Edge only
Both are Chromium-based, so one codebase and one build work for both.

## ADR-002: WXT over CRXJS
Actively maintained Vite-based setup, file-based entrypoints,
auto-generated manifest, HMR and one-command production zip.
CRXJS remains a fine alternative.

## ADR-003: Vue 3 + Pinia
Lightweight runtime for a popup that opens on every click.

## ADR-004: chrome.alarms for scheduling
Service workers sleep, so setInterval won't work.

## ADR-005: chrome.offscreen for the chime
Service workers can't play audio. Edge supports this API too.

## ADR-006: storage.sync for settings, storage.local for logs
Settings follow the user across devices; logs avoid sync's
~100 KB quota.

## ADR-007: Hand-written SVG charts
No chart library for the progress ring and 7-day bars.

## ADR-008: No accounts or servers
All data stays on the device.

## ADR-009: The project lives at the repository root
The guide scaffolds into a `hydrately/` subfolder. This repository is
the project, so the WXT app sits at the root next to `GUIDE.md`.

## ADR-010: The design system replaces the guide's placeholder palette
The guide's DESIGN.md colours (#1e3a5f, #3B82F6) were placeholders to
"adjust to your brand". The Hydrate.ly design system (Figtree, the
`water` accent, ink primary buttons, light and dark themes) is the brand.
See docs/DESIGN.md.

## ADR-011: Settings are a popup tab and an options page
The design puts Settings in the popup's tab bar; the guide asks for an
options page. Both render the same `SettingsForm.vue`, so there is one
implementation and no drift.

## ADR-012: Figtree is bundled, not loaded from Google Fonts
The design loads Figtree from Google Fonts. The extension makes no
network requests (ADR-008, SECURITY.md), so the font ships inside the
build via `@fontsource-variable/figtree`.

## ADR-013: Tokens are Tailwind 4 theme variables
The tokens live in `assets/styles/main.css` under `@theme` as
`--color-*`, `--radius-*`, `--text-*` and `--shadow-*`. Dark mode
overrides the same variables under `prefers-color-scheme: dark`; there is
no `data-theme` attribute and no JavaScript theme switch.

## ADR-014: Explicit imports, no WXT auto-imports
`imports: false` in `wxt.config.ts`. Every import is visible, which makes
AI-generated code easier to review, lint and type check.

## ADR-015: Amounts are stored in millilitres
The ml / oz setting changes display and input only. Switching units
never rewrites the log. 1 oz = 29.5735 ml, rounded for display.

## ADR-016: Pause, Pomodoro round and idle flags live in storage.local
They are device state, not preferences: pausing on a laptop should not
silence a desktop. Only user settings go to storage.sync.

## ADR-017: Suppressed reminders are skipped, not queued
The alarms keep running while reminders are paused, in quiet hours, or
while the user is away; a due reminder is simply not shown. This keeps
scheduling in one place. If a reminder was skipped because the user was
away, the countdowns restart from a full interval when they return.
Brief idle spells that skipped nothing do not reset anything.

## ADR-018: Logging a drink restarts the water countdown
There is no point reminding someone who has just had a drink. This
applies to logs from the popup and from the notification.

## ADR-019: Pomodoro reminds at the start of each break only
25 minutes of focus, then a reminder for a 5 minute break (15 minutes
every 4th round). There is no second notification when the break ends:
"calm, never nagging". The next reminder is scheduled for break length
plus 25 minutes. A snoozed break does not count as a new round.

A break that is suppressed (paused, quiet hours, away) counts no round
and resets the cycle to zero, and so does a browser restart: a long
break has to be earned by four rounds actually worked in a row.

## ADR-020: The daily average ignores days before the first log
The 7-day mean leaves out days before the user's first ever entry, so a
new user's average is not dragged down by days without the extension.
Empty days after the first log do count.

## ADR-021: Defaults mirror the design
45 minute water reminders, 20-20-20 breaks on, banner style, chime on,
2,500 ml goal, quiet hours 20:00 to 08:00, auto-pause on. The default
message is "Small sips, better focus." under the fixed title "Time for
a sip", which matches the notification design without repeating the
title in the message.

## ADR-022: Notifications are always silent; the chime is ours
`silent: true` on every notification, so the OS sound and the chime
never double up and "chime off" really is silent.

Accepted limitation: an extension cannot tell when the OS is in Focus
Assist or Do Not Disturb. The OS hides the notification, but the chime
can still play. The settings note says so.

## ADR-023: "Until tomorrow" ends at the next wake time
The pause ends at the next occurrence of the wake time (the end of quiet
hours, or 8:00 AM when quiet hours are off). Pressed at 1 AM, that is
this morning, not the morning after.

## ADR-024: Storage writes are serialized with Web Locks
Every write is read-modify-write on one key, so two that overlap would
lose one (a drink logged in the popup while "I drank" is clicked on a
notification). `services/storage.ts` wraps each write in
`navigator.locks.request`, which is shared by the popup, the options
page and the service worker. It needs no permission.

## ADR-025: The streak is judged against the current goal
Past days are compared with today's goal, so raising the goal can
shorten or reset a streak. Kept for now because it needs no extra
storage. Storing each day's goal is a follow-up in TASKS.md.

## ADR-026: Settings sync, and the privacy line stays as designed
Settings stay in storage.sync because cross-device sync is wanted. The
footer still reads "Everything stays on this device", which is not
strictly true for settings when browser sync is on. Rewording it is a
follow-up in TASKS.md and should happen before the store listing.
