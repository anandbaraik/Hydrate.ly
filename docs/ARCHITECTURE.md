# Architecture

## Platform
Manifest V3 extension for Chrome and Edge, built with WXT.
The same chrome.* APIs work in Edge with no code changes.
Minimum browser version: 116 (for `runtime.getContexts`).

## UI
Vue 3 + TypeScript + Tailwind CSS 4
State: Pinia

## Flow
```
chrome.alarms fires
  ↓
Background service worker (entrypoints/background.ts)
  ↓ services/reminders.ts checks pause state, quiet hours, idle state
chrome.notifications shows reminder
  ↓ (optional chime via offscreen document)
User clicks Snooze or "I drank"
  ↓
Service worker updates storage and reschedules the alarm
  ↓
Popup reads storage → progress ring and history update
```

## APIs
- chrome.alarms: scheduling (setInterval won't work;
  service workers sleep)
- chrome.notifications: reminders with Snooze / "I drank" buttons
- chrome.offscreen: plays the chime (service workers can't play audio)
- chrome.storage.sync: settings, which follow the user across devices
- chrome.storage.local: intake logs (avoids sync's ~100 KB quota) and
  device-specific reminder state (pause, Pomodoro round)
- chrome.idle: auto-pause when the user is away

## Folder structure
```
entrypoints/
├── background.ts       # registers listeners; all logic is in services/
├── popup/              # App.vue frame + views/ (Today, History, Settings)
├── options/            # full-page settings (same form as the popup tab)
└── offscreen/          # chime playback
components/             # ProgressRing, HistoryBars, QuickAdd, BottomSheet,
                        # SettingsForm, AppIcon and the other UI pieces
stores/                 # Pinia: settings, intake, reminders
services/               # the only code that touches chrome.* APIs
├── storage.ts          # sync for settings, local for logs and runtime state
├── alarms.ts           # schedule, clear and read chrome.alarms
├── notifications.ts    # show and clear reminders, button events
├── chime.ts            # offscreen document + audio
├── idle.ts             # chrome.idle
└── reminders.ts        # the reminder flow, built from the services above
types/                  # Settings, IntakeEntry, RuntimeState
utils/                  # pure logic: units, dates, history, progress, quiet
                        # hours, pause, validation, notification content
tests/                  # Vitest: utils, storage and the reminder flow
assets/styles/main.css  # Tailwind + design tokens (light and dark)
public/                 # icons, notification icons, chime.wav
scripts/                # generate-assets.mjs (icons and chime)
```

## Data

| Key | Area | Shape |
| --- | --- | --- |
| `settings` | storage.sync | `Settings` (interval, breaks, message, style, chime, goal, unit, quiet hours, auto-pause) |
| `entries` | storage.local | `IntakeEntry[]`: `{ id, at, ml, source }`, pruned to 366 days |
| `runtime` | storage.local | `RuntimeState`: `{ pausedUntil, pomodoroRound, breakSnoozed, skippedWhileAway }` |

Amounts are always stored in millilitres. The ml / oz setting only
changes how they are displayed and typed (1 oz = 29.5735 ml).

Everything read from storage passes through `utils/validation.ts`
(`sanitizeSettings`, `sanitizeEntries`, `sanitizeRuntime`), so missing or
malformed data falls back to defaults instead of breaking the UI.

## Alarms

| Alarm | Schedule |
| --- | --- |
| `hydrately:water` | Repeats every `waterIntervalMin`. Snooze recreates it with a 10 minute delay. Logging a drink restarts it from a full interval. |
| `hydrately:break` (20-20-20) | Repeats every 20 minutes. Snooze recreates it with a 5 minute delay. |
| `hydrately:break` (Pomodoro) | One-shot. Each break schedules the next: break length (5 min, or 15 min every 4th round) plus 25 min of focus. A suppressed break counts no round and restarts the cycle with 25 min of focus. |

Alarms are created on install and checked on browser startup and each
time the popup opens (`initReminders`), because the browser may clear
them on restart. Browser startup also begins a fresh Pomodoro cycle.

Storage writes are read-modify-write on one key, so `services/storage.ts`
runs each one under a Web Lock shared by the popup, the options page and
the service worker (ADR-024).

A due reminder stays silent when reminders are paused, during quiet
hours, or when the user is away (idle or locked for 5 minutes, if
auto-pause is on). When a reminder was skipped because the user was
away, the countdowns restart from a full interval on their return.

## Rules
- Vue components never call chrome.* APIs directly; use services/.
  ESLint enforces this (`no-restricted-imports` on `wxt/browser`).
- Settings live only in storage.sync; logs only in storage.local.
- All scheduling goes through chrome.alarms. ESLint bans `setInterval`
  and `setTimeout` in the background script and services.
- Progress ring and bar chart are hand-written SVG.
- No network requests. The Figtree font is bundled with the extension.
