# Hydrate.ly – Water & Break Reminder

**Small sips, better focus.**

A browser extension for Google Chrome and Microsoft Edge that reminds you
to drink water and take breaks, and tracks your daily intake. No account,
no servers, no subscription: everything stays on your device.

> **Status:** the first version is feature-complete and passes its
> automated checks. It has not yet been through the manual test plan in
> real Chrome and Edge, and it is not published to the stores yet. See
> [Project status](#project-status).

## Contents

- [Features](#features)
- [Install from source](#install-from-source)
- [Using it](#using-it)
- [Technology, and why](#technology-and-why)
- [Design](#design)
- [Architecture](#architecture)
- [Key decisions](#key-decisions)
- [Project structure](#project-structure)
- [Commands](#commands)
- [Testing](#testing)
- [Working with Claude Code](#working-with-claude-code)
- [Privacy and permissions](#privacy-and-permissions)
- [Publishing](#publishing)
- [Project status](#project-status)

## Features

- **Water reminders** every 30, 45 or 60 minutes, or a custom interval
  from 15 minutes to 4 hours
- **Break reminders**: the 20-20-20 eye rule, or Pomodoro-style focus
  and break rounds
- **Quick actions** on the notification: "I drank 250 ml" and Snooze
- **Intake tracking**: one tap for 250 ml or 500 ml, or a custom amount,
  with a progress ring toward your daily goal (default 2,500 ml)
- **7-day history** with daily average and streak
- **Focus-friendly**: quiet hours, one-click pause (30 minutes, 1 hour,
  until tomorrow) and auto-pause while you're away
- **Your way**: ml or oz, custom reminder message, banner or persistent
  notifications, optional gentle chime, light and dark themes
- **100% private**: five permissions, no network requests

Not in this version, on purpose: accounts or sign-in, servers,
subscriptions, and browsers other than Chrome and Edge.

## Install from source

You need [Node.js](https://nodejs.org) 22 or newer, and Chrome or Edge
version 116 or newer.

```bash
git clone https://github.com/anandbaraik/Hydrate.ly.git
cd Hydrate.ly
npm install
npm run build
```

Then load the build in your browser:

1. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and choose the `.output/chrome-mv3` folder.
4. Pin Hydrate.ly to the toolbar and click the drop to open it.

The same build works in both browsers.

## Using it

Click the drop in the toolbar. The popup has three tabs.

- **Today**: see your progress and log a drink in one tap: +250 ml,
  +500 ml, or Custom for any other amount. Undo sits right under the
  buttons. "Up next" shows when the next reminders are due.
- **History**: the last 7 days as bars against your goal, your daily
  average and streak, and today's log. Remove an entry with the × button.
- **Settings**: reminder interval, break style, notification message
  and style, chime, daily goal, units, quiet hours and auto-pause. The
  same settings open as a full page from the extension's Options.

### Reminders

A reminder is a normal browser notification with two buttons.

| Reminder | Buttons | What they do |
| --- | --- | --- |
| Water | **I drank 250 ml** | Logs 250 ml and starts the countdown again |
| | **Snooze 10 min** | Brings the reminder back in 10 minutes |
| Break | **Done** | Closes it; the next break is already scheduled |
| | **Snooze 5 min** | Brings the reminder back in 5 minutes |

Logging a drink in the popup also restarts the water countdown: there is
no point reminding you straight after a drink.

Break styles:

- **20-20-20**: every 20 minutes, look at something 20 feet away for
  20 seconds.
- **Pomodoro**: 25 minutes of focus, then a 5 minute break, with a
  15 minute break after every fourth round.

### Staying quiet

Reminders are skipped, not queued, in three cases:

- **Pause**: tap Pause on the Today tab and pick 30 minutes, 1 hour or
  Until tomorrow. Until tomorrow ends at the next wake time (the end of
  quiet hours, or 8:00 AM). Resume ends a pause early.
- **Quiet hours**: no reminders inside the window you set. The default
  is 8:00 PM to 8:00 AM.
- **Away**: no reminders once the computer has been idle or locked for
  5 minutes. They start again when you return.

### Not seeing reminders?

- On Windows, Focus Assist or Do Not Disturb hides them, though the
  chime can still play.
- Check that notifications are allowed for your browser in the system
  settings.
- Check that reminders are not paused or inside quiet hours: the Today
  tab says so above the countdowns.

## Technology, and why

| Layer | Choice | Why |
| --- | --- | --- |
| Platform | Manifest V3 | The current extension platform; one build runs in Chrome and Edge |
| Extension framework | [WXT](https://wxt.dev) | Maintained, Vite-based, file-based entrypoints, generates the manifest, hot reload, one-command zip |
| UI | Vue 3 | A light runtime suits a popup that is created on every click |
| State | Pinia | Simple stores for settings, intake and reminders |
| Language | TypeScript | Typed browser APIs and safer AI-generated code |
| Styling | Tailwind CSS 4 | The design tokens live in one place and both pages use them |
| Charts | Hand-written SVG | A ring and seven bars do not justify a chart library |
| Font | Figtree, bundled | The design's typeface, shipped in the build so nothing is fetched |
| Tests | Vitest + WXT's fake browser | Storage and alarms can be tested without a real browser |
| Lint | ESLint | Also enforces the architecture rules below |
| Development tool | [Claude Code](https://claude.com/claude-code) | Works inside the local repository, with project rules it reads every session |

TypeScript is pinned to 6.0 for now, because typescript-eslint does not
support TypeScript 7 yet.

## Design

The interface is built from two sources:

- **Screens:** [Hydrate.ly design](https://claude.ai/artifact/WNucKjL62Mdn7diAKGqSRz).
  The popup's Today, History and Settings screens, the Pause sheet, and
  the water and eye-break notifications.
- **Design system:** [Hydrate.ly design system](https://claude.ai/artifact/QEMQs93Kj2NdfJo9o6eJ2S).
  Colours for light and dark themes, type, spacing, radii, icons,
  components and the voice for copy.

In short: one accent colour that always means water, ink for primary
buttons, the Figtree typeface, white cards on a cool off-white ground,
and targets at least 44 px tall. Calm, never nagging.

The tokens live in [assets/styles/main.css](assets/styles/main.css) as
Tailwind theme variables, so classes such as `bg-surface` and
`text-ink-muted` read from one place. The working copy of the design
rules for this codebase is [docs/DESIGN.md](docs/DESIGN.md).

## Architecture

One Manifest V3 extension with four entry points and no backend.

```
chrome.alarms fires
  ↓
Background service worker        entrypoints/background.ts
  ↓  checks pause, quiet hours and idle state      services/reminders.ts
chrome.notifications shows the reminder
  ↓  optional chime, played by an offscreen document
User clicks Snooze or "I drank"
  ↓
Service worker updates storage and reschedules the alarm
  ↓
Popup reads storage → progress ring and history update
```

### Layers

The code is split so that each layer only talks to the one below it.

| Layer | Folder | Role |
| --- | --- | --- |
| Entry points | `entrypoints/` | Background worker, popup, options page, offscreen chime page |
| Components | `components/` | Vue UI. Never touches browser APIs |
| Stores | `stores/` | Pinia state for the UI: settings, intake, reminders |
| Services | `services/` | The only code that calls `chrome.*` APIs |
| Utils | `utils/` | Pure logic with no browser dependency, so it is easy to test |

### Browser APIs

| API | Used for |
| --- | --- |
| `chrome.alarms` | All scheduling. Service workers sleep, so timers would never fire |
| `chrome.notifications` | Reminders with two action buttons |
| `chrome.offscreen` | Playing the chime. A service worker cannot play audio |
| `chrome.storage.sync` | Settings, so they follow you across devices |
| `chrome.storage.local` | The intake log and pause state, which stay on this device |
| `chrome.idle` | Detecting that you are away |

### Data

| Key | Where | What |
| --- | --- | --- |
| `settings` | `storage.sync` | Interval, breaks, message, style, chime, goal, unit, quiet hours, auto-pause |
| `entries` | `storage.local` | Each logged drink: id, time, amount in ml, source. Kept for 366 days |
| `runtime` | `storage.local` | Pause end time, Pomodoro round, away flag |

Amounts are always stored in millilitres. The ml / oz setting only
changes how they are shown and typed. Everything read from storage is
validated first, so missing or malformed data falls back to defaults.

The full write-up is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Key decisions

The reasoning behind the project, in short. Each one is recorded in full
in [docs/DECISIONS.md](docs/DECISIONS.md).

- **Chrome and Edge only** (ADR-001). Both are Chromium-based, so one
  codebase and one build cover both.
- **`chrome.alarms` for all scheduling** (ADR-004). The service worker
  sleeps; `setInterval` and `setTimeout` would not survive that.
- **An offscreen document for the chime** (ADR-005).
- **Settings in `storage.sync`, logs in `storage.local`** (ADR-006).
  Settings follow you; logs avoid sync's small quota.
- **No accounts or servers** (ADR-008). No network requests at all, which
  is also why the font is bundled (ADR-012).
- **Settings are both a popup tab and an options page** (ADR-011). Both
  render the same form, so they cannot drift apart.
- **Suppressed reminders are skipped, not queued** (ADR-017). The alarms
  keep running; a due reminder is simply not shown.
- **Logging a drink restarts the water countdown** (ADR-018).
- **Pomodoro notifies only when a break starts** (ADR-019), in keeping
  with "calm, never nagging". A long break has to be earned by four
  rounds worked in a row.
- **Notifications are silent; the chime is ours** (ADR-022). So "chime
  off" really is silent. The trade-off: the chime can still play when the
  OS is hiding notifications.
- **Storage writes run under a Web Lock** (ADR-024), so a drink logged in
  the popup and one logged from a notification at the same moment are
  both kept.

## Project structure

```
├── docs/                 # PRD, architecture, design, test plan, security,
│                         # decisions, project memory
├── .claude/rules/        # path-specific rules for Claude Code
├── entrypoints/
│   ├── background.ts     # service worker: alarms, notifications, idle
│   ├── popup/            # Today, History and Settings
│   ├── options/          # full-page settings
│   └── offscreen/        # chime playback
├── components/           # ProgressRing, HistoryBars, SettingsForm, ...
├── stores/               # Pinia: settings, intake, reminders
├── services/             # the only code that touches chrome.* APIs
├── types/
├── utils/                # pure logic: units, dates, history, validation
├── tests/                # Vitest unit tests
├── assets/styles/        # Tailwind and design tokens
├── public/               # icons, chime audio
├── scripts/              # asset generation
├── guide.md              # the workflow this project follows
├── CLAUDE.md             # what Claude Code reads at the start of a session
├── RULES.md              # how AI (and humans) should code here
├── TASKS.md              # what is done and what to build next
└── wxt.config.ts         # manifest and build configuration
```

## Commands

```bash
npm install          # install dependencies and generate WXT's types

npm run dev          # Chrome with the extension loaded and hot reload
npm run dev:edge     # the same, in Edge
npm run build        # production build in .output/chrome-mv3
npm run build:edge   # production build in .output/edge-mv3
npm run zip          # production .zip for the stores

npm run lint         # ESLint
npm run typecheck    # vue-tsc
npm test             # Vitest unit tests, once
npm run test:watch   # Vitest in watch mode
npm run assets       # regenerate icons and the chime in public/
```

Run `lint`, `typecheck` and `test` after every change.

## Testing

### Automated

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The unit tests cover the logic that is easy to get wrong: unit
conversion, date helpers, streak and average, the progress label, quiet
hours, pause, input validation, the split between sync and local
storage, overlapping writes, and the reminder flow from alarm to
notification to Snooze or "I drank".

ESLint also guards the architecture: it rejects timers in the background
script and services, and browser API calls from components and stores.

### By hand

1. `npm run build`, then load `.output/chrome-mv3` as an unpacked
   extension (see [Install from source](#install-from-source)).
2. On the extensions page, open the **service worker** link on the
   Hydrate.ly card to see its console.
3. To fire a reminder in 15 seconds instead of waiting, paste this into
   that console:

   ```js
   chrome.alarms.create('hydrately:water', { when: Date.now() + 15000, periodInMinutes: 45 });
   chrome.alarms.create('hydrately:break', { when: Date.now() + 15000, periodInMinutes: 20 });
   ```

4. Click both notification buttons, then try quiet hours and each pause
   option.
5. Leave the browser idle long enough for the service worker to sleep,
   and confirm the next reminder still fires.

The full checklist is in [docs/TEST_PLAN.md](docs/TEST_PLAN.md). Run it
in both Chrome and Edge before publishing.

## Working with Claude Code

This project is developed with [Claude Code](https://claude.com/claude-code)
and follows the workflow in [guide.md](guide.md).

Claude Code loads [CLAUDE.md](CLAUDE.md) at the start of every session.
It pulls in `RULES.md` and points to the docs to read before changing
anything:

| File | Answers |
| --- | --- |
| [docs/PRD.md](docs/PRD.md) | What are we building, and what is out of scope? |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How does it work, and where does code belong? |
| [docs/DESIGN.md](docs/DESIGN.md) | How should it look and read? |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why was it built this way? |
| [docs/MEMORY.md](docs/MEMORY.md) | What is the current state? |
| [docs/TEST_PLAN.md](docs/TEST_PLAN.md) | How do we verify it? |
| [docs/SECURITY.md](docs/SECURITY.md) | How do we keep it private? |
| [RULES.md](RULES.md) | How should code be written here? |
| [TASKS.md](TASKS.md) | What is done, and what is next? |

The rules in `.claude/rules/` load on their own when the files they
cover are touched.

Work through one task at a time: implement, test, review, mark complete
in `TASKS.md`, and update `docs/MEMORY.md`.

## Privacy and permissions

Hydrate.ly has no accounts, no servers and no analytics, and makes no
network requests. Your settings are saved with the browser's own sync
storage, and your intake log stays on this device.

Permissions, and why each one is needed:

| Permission | Why |
| --- | --- |
| Notifications | Show water and break reminders |
| Alarms | Schedule reminders |
| Storage | Save your goal, log and settings |
| Idle | Pause reminders while you're away |
| Offscreen | Play the reminder chime |

There are no host permissions and no content scripts: the extension
never reads or changes the pages you visit. See
[docs/SECURITY.md](docs/SECURITY.md).

## Publishing

1. Run the full [test plan](docs/TEST_PLAN.md) in Chrome and Edge.
2. `npm run zip`
3. Upload the `.zip` from `.output/` to the Chrome Web Store and to
   Microsoft Edge Add-ons. The same file works for both.

The Chrome Web Store charges a one-time $5 developer registration fee.
Publishing to Edge Add-ons is free.

## Project status

Done:

- Every feature in the first version (TASK-001 to TASK-021)
- Icons and the production zip
- A code review against the docs, with the agreed fixes applied

Still to do before publishing:

- The manual test plan in real Chrome and Edge, including the chime and
  the notifications on Windows and macOS
- Store screenshots, description and promo tile
- Rewording the privacy line in Settings, since settings do sync through
  the browser account

Known limitations:

- Raising the daily goal re-judges past days, so it can reset the streak.
- The popup does not refresh while it stays open; reopen it to see a
  pause expire or a countdown move.
- Three graphic colours from the design are below the 3:1 contrast
  guideline: input borders, missed-day bars and the ring.

The full list, with task numbers, is in [TASKS.md](TASKS.md).
