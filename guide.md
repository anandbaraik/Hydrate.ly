# Hydrate.ly – Vibe Coding Guide

Oct 2, 2026 · @Anand Baraik

## The complete workflow

Hydrate.ly ships as one Manifest V3 extension for Chrome and Edge, built step by step with AI. Follow every stage in order. Never jump from idea → AI → publish.

1. Idea
2. Research
3. Define the user
4. PRD
5. Choose tech stack
6. Architecture
7. Design
8. Project rules
9. Task breakdown
10. Setup
11. Development
12. Testing
13. Privacy and permissions review
14. Code review
15. Local QA (load unpacked in Chrome and Edge)
16. Publish to Chrome Web Store and Edge Add-ons
17. Monitor reviews and feedback
18. Iterate

**Product at a glance**

- **Name:** Hydrate.ly – Water & Break Reminder
- **Tagline:** Small sips, better focus
- **Targets:** Google Chrome and Microsoft Edge. Both are Chromium-based, so one codebase and one build work for both.

## Step 1: Define what you're building

Answer these five questions before opening any AI coding tool.

**1. What problem are you solving?** People working at a screen forget to drink water and take breaks.

**2. Who is the user?** Anyone who spends long hours in Chrome or Edge.

**3. What is the main outcome?** Timely reminders to hydrate and rest, plus a simple way to track daily water intake. Small sips, better focus.

**4. What is the MVP?**

- Smart water and break reminders
- Intake tracking with a daily goal
- Quick actions on notifications (Snooze, "I drank")
- 7-day history
- Focus-friendly controls (quiet hours, pause, auto-pause when away)
- 100% private, on-device storage

**5. What is NOT part of the first version?**

- Accounts or sign-in
- Servers or backend
- Subscriptions or payments
- Browsers other than Chrome and Edge

Writing the out-of-scope list stops the AI from expanding the project on its own.

## Step 2: Research before coding

Don't ask AI to build an idea you haven't researched.

**Users**

- Who needs reminders to drink water and take breaks?
- What do they use today, and what annoys them about it?

**Competitors**

Study existing hydration extensions in the Chrome Web Store and Edge Add-ons. Compare their features, UI, user experience, strengths and weaknesses. Note what users complain about in reviews.

**Technical feasibility**

Confirm each API the spec depends on, using official documentation:

- `chrome.alarms` for scheduling
- `chrome.notifications` with action buttons
- `chrome.offscreen` for audio
- `chrome.storage.sync` and `chrome.storage.local`
- `chrome.idle` for auto-pause

For technical decisions, prefer the Chrome Extensions docs and Microsoft Edge extension docs over blog posts.

## Step 3: Choose your AI tool and stack

Use Cursor or Claude Code. A browser extension is built and tested locally, so you want a tool that works inside a local repository.

- **Cursor:** more control, local development, project rules in `.cursor/rules/`
- **Claude Code:** terminal-based, repository-level and agentic tasks

**Recommended stack: WXT + Vue 3 + TypeScript + Tailwind**

| Layer | Choice | Why |
| --- | --- | --- |
| Extension framework | WXT | Actively maintained Vite-based setup, file-based entrypoints, auto-generated manifest, HMR, one-command production zip |
| UI | Vue 3 | Lightweight runtime for a popup that opens on every click |
| State | Pinia | Simple state for settings and logs |
| Language | TypeScript | Typed `chrome.*` APIs and safer AI-generated code |
| Styling | Tailwind CSS | Consistent design tokens across popup and options page |
| Charts | Hand-written SVG | Progress ring and 7-day bars without a chart library |
| Version control | Git + GitHub | Roll back when AI breaks something |

CRXJS is a fine alternative now that the scope is Chromium-only. The cross-browser advantage of WXT no longer matters, but its developer experience still makes it the better pick.

## Step 4–5: Install the environment and create the project

**Required**

- Cursor or VS Code (with Claude Code if you prefer the terminal)
- Git and a GitHub account
- Node.js LTS and npm
- Google Chrome and Microsoft Edge for testing

Verify your installation:

```bash
node --version
npm --version
git --version
```

**Scaffold with WXT (Vue template)**

```bash
npx wxt@latest init hydrately
cd hydrately
npm install
git init
```

Then create a GitHub repository and push the first commit. Version control from day one lets you change → test → break → compare → roll back.

**Run it locally**

```bash
npm run dev            # launches Chrome with the extension loaded
npx wxt -b edge        # same, in Edge
npm run zip            # production .zip for the stores
```

Hydrate.ly has no accounts, servers or API keys, so it needs no `.env` file. Keep it that way: if a secret ever appears in the codebase, something has gone outside the MVP.

## Step 6: Create your project documentation

Before asking AI to build features, give it project context in files it can read every session.

```
hydrately/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── TEST_PLAN.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   └── MEMORY.md
├── .cursor/
│   └── rules/
├── RULES.md
├── TASKS.md
└── README.md
```

| File | Purpose | Stage |
| --- | --- | --- |
| PRD.md | What are we building? | Planning |
| ARCHITECTURE.md | How will we build it? | Planning |
| DESIGN.md | How should it look? | Planning |
| RULES.md | How should AI code? | Planning |
| TASKS.md | What should we build next? | Development |
| DECISIONS.md | Why did we decide this? | Development |
| MEMORY.md | What is the current state? | Development |
| TEST\_PLAN.md | How do we verify it? | Testing |
| SECURITY.md | How do we keep it private? | Development |
| README.md | How do humans use it? | Documentation |

## Step 7: Create PRD.md

PRD = what we're building and why. Copy this into `docs/PRD.md`.

```markdown
# Product Requirements Document

## Product
Hydrate.ly – Water & Break Reminder
Tagline: Small sips, better focus

## Problem
People at a screen forget to drink water and take breaks.

## Target users
People who spend long hours in Google Chrome or Microsoft Edge.

## Goal
Remind users to hydrate and rest, and track daily water intake,
without accounts, servers or subscriptions.

## Core features (MVP)

### Smart Reminders
- Water reminders: presets of 30, 45 or 60 minutes,
  plus a custom interval from 15 minutes to 4 hours
- Break reminders: 20-20-20 eye rule or Pomodoro-style intervals
- Native browser notification with an optional gentle chime
- Custom notification message
- Persistent or banner-style notifications

### Intake Tracking
- One-tap logging: 250 ml, 500 ml or a custom amount
- Daily goal with a progress ring in the popup (default 2,500 ml)
- ml / oz unit toggle

### Quick Actions
- Snooze and "I drank" buttons on the notification

### 7-Day History
- Bar chart of intake over the past week
- Daily average and streak count

### Focus-Friendly
- Quiet hours (e.g. no reminders after 8 PM)
- One-click pause: 30 minutes, 1 hour, or until tomorrow
- Auto-pause when the user is away (chrome.idle)

### 100% Private
- No accounts, servers or subscriptions
- All data stays on the device

## Targets
Google Chrome and Microsoft Edge (one codebase, one build)

## Out of scope
- Other browsers
- Accounts or sign-in
- Servers or backend
- Subscriptions or payments

## Success criteria
A user can:
1. Install the extension in Chrome or Edge
2. Set a daily goal and reminder interval
3. Receive a water reminder on schedule
4. Log a drink from the popup or the notification
5. Snooze a reminder from the notification
6. See the progress ring fill toward the goal
7. See the last 7 days of intake, average and streak
8. Get no reminders during quiet hours or while paused
```

## Step 8: Create ARCHITECTURE.md

Architecture = how it works. Copy this into `docs/ARCHITECTURE.md`.

```markdown
# Architecture

## Platform
Manifest V3 extension for Chrome and Edge, built with WXT.
The same chrome.* APIs work in Edge with no code changes.

## UI
Vue 3 + TypeScript + Tailwind CSS
State: Pinia

## Flow
chrome.alarms fires
  ↓
Background service worker
  ↓ checks quiet hours, pause state, idle state
chrome.notifications shows reminder
  ↓ (optional chime via offscreen document)
User clicks Snooze or "I drank"
  ↓
Service worker updates storage
  ↓
Popup reads storage → progress ring and history update

## APIs
- chrome.alarms: scheduling (setInterval won't work;
  service workers sleep)
- chrome.notifications: reminders with Snooze / "I drank" buttons
- chrome.offscreen: plays the chime (service workers can't play audio)
- chrome.storage.sync: settings, which follow the user across devices
- chrome.storage.local: intake logs (avoids sync's ~100 KB quota)
- chrome.idle: auto-pause when the user is away

## Folder structure
entrypoints/
├── background.ts       # alarms, notifications, idle
├── popup/              # progress ring, quick log, history
├── options/            # settings page
└── offscreen/          # chime playback
components/             # ProgressRing.vue, HistoryBars.vue
stores/                 # Pinia: settings, intake
services/               # storage, alarms, notifications wrappers
types/
utils/                  # unit conversion, date helpers

## Rules
- Vue components never call chrome.* APIs directly; use services/.
- Settings live only in storage.sync; logs only in storage.local.
- All scheduling goes through chrome.alarms.
- Progress ring and bar chart are hand-written SVG.
```

## Step 9: Create DESIGN.md

Without a design file, every screen the AI builds looks different. Copy this into `docs/DESIGN.md` and adjust the colors to your brand.

```markdown
# Design System

## Style
Simple, minimal, calm. No gradients.

## Surfaces
- Popup: progress ring, quick-log buttons, 7-day history
- Options page: all settings
- Notification: title, custom message, Snooze and "I drank" buttons

## Popup layout (top to bottom)
1. Progress ring with today's total / goal (e.g. 1,250 / 2,500 ml)
2. Quick log: 250 ml, 500 ml, Custom
3. Pause control: 30 min, 1 hour, until tomorrow
4. 7-day bar chart with daily average and streak

## Colors
Primary: #1e3a5f
Accent (water): #3B82F6
Background: #F7F7F7
Border: #CCCCCC
Text: #0F172A
Muted: #64748B

## Typography
System font stack

## Components
- Buttons: primary, secondary
- Cards: 8px radius, 1px border
- Progress ring and bars: hand-written SVG

## UX requirements
- Fixed popup width; no horizontal scroll
- Empty state: no drinks logged today
- Show units the user picked (ml or oz) everywhere
- Accessible: labelled buttons, keyboard navigation, visible focus
- Settings page includes a note: on Windows, Focus Assist or
  Do Not Disturb silences reminders
```

## Step 10: Create RULES.md

RULES.md is the AI's rulebook for this project.

```markdown
# Development Rules

## General
- Use TypeScript and Vue 3 Composition API.
- Reuse existing components and services.
- Keep functions small. Do not duplicate logic.
- Do not modify unrelated files.

## Before coding
- Read the relevant docs in docs/.
- Inspect the existing implementation.
- Make a plan for large changes.

## Extension
- Manifest V3 only.
- Never use setInterval or setTimeout for reminders; use chrome.alarms.
- Never play audio from the service worker; use the offscreen document.
- Settings → chrome.storage.sync. Intake logs → chrome.storage.local.
- Do not add permissions beyond: notifications, alarms, storage,
  idle, offscreen.
- No network requests, analytics or remote code.

## UI
- Follow DESIGN.md.
- Draw charts with hand-written SVG; no chart libraries.
- Include empty states.

## Testing
- Add tests for important logic.
- Run lint, type check and tests after every change.
- Fix failing tests before continuing.

## Git
- Small commits with descriptive messages.
```

In Cursor, split these into `.cursor/rules/` files such as `general.mdc`, `extension.mdc`, `ui.mdc` and `testing.mdc`.

## Step 11: Create TASKS.md

Never ask AI to build the whole extension in one prompt. Work through one task at a time: implement → test → review → mark complete → next.

```markdown
# Tasks

## Phase 1: Setup
- [ ] TASK-001 Scaffold WXT project with Vue 3 + TypeScript
- [ ] TASK-002 Configure Tailwind, lint and type check
- [ ] TASK-003 Declare permissions in the manifest
- [ ] TASK-004 Create storage service (sync for settings, local for logs)

## Phase 2: Water reminders
- [ ] TASK-005 Schedule water reminders with chrome.alarms
- [ ] TASK-006 Show notification with custom message
- [ ] TASK-007 Add Snooze and "I drank" notification buttons
- [ ] TASK-008 Persistent vs banner-style option
- [ ] TASK-009 Optional chime via offscreen document

## Phase 3: Intake tracking
- [ ] TASK-010 Quick log: 250 ml, 500 ml, custom
- [ ] TASK-011 Progress ring (SVG) with daily goal
- [ ] TASK-012 ml / oz toggle

## Phase 4: Break reminders
- [ ] TASK-013 20-20-20 eye rule reminders
- [ ] TASK-014 Pomodoro-style intervals

## Phase 5: Focus-friendly
- [ ] TASK-015 Quiet hours
- [ ] TASK-016 One-click pause (30 min, 1 hour, until tomorrow)
- [ ] TASK-017 Auto-pause with chrome.idle

## Phase 6: History
- [ ] TASK-018 7-day bar chart (SVG)
- [ ] TASK-019 Daily average and streak

## Phase 7: Settings and release
- [ ] TASK-020 Options page with all settings
- [ ] TASK-021 Focus Assist / Do Not Disturb note on Windows
- [ ] TASK-022 Store listing assets and production zip
```

## Step 12–13: Create DECISIONS.md and MEMORY.md

DECISIONS.md stores permanent decisions, so the AI doesn't quietly undo them. MEMORY.md stores the current state.

```markdown
# Architecture Decisions

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
```

```markdown
# Project Memory

## Current status
Water reminders done. Intake tracking in progress.

## Completed
- TASK-001 to TASK-009

## Current task
TASK-011 Progress ring

## Known issues
- Chime plays twice when two alarms fire together

## Next step
TASK-012 ml / oz toggle
```

The MEMORY.md above is an example. Update it at the end of every session.

## Step 14–15: Create TEST\_PLAN.md and SECURITY.md

TEST\_PLAN.md defines what "working" means. Run it in both Chrome and Edge.

```markdown
# Test Plan

## Reminders
- Water reminder fires at 30, 45, 60 min and at a custom interval
- Custom interval accepts 15 min to 4 hours only
- Reminders still fire after the browser has been idle
  (service worker asleep)
- Custom message appears in the notification
- Persistent notification stays; banner disappears
- Chime plays when on, stays silent when off
- 20-20-20 and Pomodoro break reminders fire correctly

## Quick actions
- "I drank" logs a drink and updates the progress ring
- Snooze delays the next reminder

## Intake
- 250 ml, 500 ml and custom amounts log correctly
- Progress ring matches today's total / goal (default 2,500 ml)
- ml / oz toggle converts everywhere

## History
- 7-day bars match logged totals
- Average and streak are correct

## Focus-friendly
- No reminders during quiet hours
- Pause for 30 min, 1 hour, until tomorrow works
- Auto-pause when idle; reminders resume on return

## Storage
- Settings sync to another signed-in browser
- Logs survive a browser restart

## Browsers
- Chrome and Edge, Windows and macOS
- Windows Focus Assist / Do Not Disturb note is visible
```

SECURITY.md is mostly about privacy and permissions for this extension.

```markdown
# Security and Privacy Requirements

## Privacy
- No accounts, servers or subscriptions.
- All data stays on the device.
- No network requests, analytics or remote code.

## Permissions (only these)
- Notifications: to show water and break reminders
- Alarms: to schedule reminders
- Storage: to save the goal, logs and settings
- Idle: to auto-pause reminders when you're away
- Offscreen: to play the reminder chime

Keep the permission list minimal. Fewer permissions mean
faster review and more user trust.

## Input
- Validate custom amounts, intervals and quiet-hour times.
- Escape the custom notification message.
```

## Step 16–19: Work with the AI

**Give the AI project context first**

Don't open with "Build my extension." Start with:

```
Read these files before making any changes:
docs/PRD.md, docs/ARCHITECTURE.md, docs/DESIGN.md,
RULES.md, TASKS.md, docs/DECISIONS.md

Do not modify anything yet.

1. Summarise the product and architecture.
2. Review the design system and rules.
3. Identify missing information.
4. Explain the implementation plan for TASK-001.

Do not write code yet.
```

**Build vertical slices**

Build one complete user flow at a time, not all UI then all logic.

1. Alarm fires → notification appears → user sees reminder
2. User clicks "I drank" → log saved → progress ring updates
3. User clicks Snooze → next alarm rescheduled → reminder returns later
4. User sets quiet hours → alarm fires → no notification shown

**Use a structured prompt**

Every prompt has six parts: context, task, files, constraints, acceptance criteria and testing.

```
CONTEXT
We are building Hydrate.ly, a Chrome/Edge MV3 extension.
Read docs/PRD.md, docs/ARCHITECTURE.md and RULES.md.

TASK
TASK-007: Add Snooze and "I drank" buttons to the water reminder.

FILES
entrypoints/background.ts
services/notifications.ts
services/storage.ts

CONSTRAINTS
- Use chrome.notifications button clicks.
- Use chrome.alarms for snooze; no setTimeout.
- Write logs to chrome.storage.local only.
- Do not add permissions. Do not modify unrelated files.

ACCEPTANCE CRITERIA
- Notification shows two buttons: Snooze and "I drank".
- "I drank" logs the default amount and clears the notification.
- Snooze reschedules the reminder.
- Works in Chrome and Edge.

TESTING
Run lint, type check and relevant tests.

After implementation, report:
1. Files changed
2. What was implemented
3. Tests executed
4. Remaining issues
```

**Keep tasks small**

- Bad: "Build the whole extension."
- Better: "Build intake tracking."
- Best: "Create the SVG progress ring component. Props: current and goal in ml. Follow DESIGN.md. Do not wire up storage yet. Do not modify unrelated files."

## Step 20–23: Test, review, debug and commit

**Test every feature**

Code → lint → type check → unit tests → manual test in Chrome → manual test in Edge.

```bash
npm run lint
npm run typecheck
npm test        # Vitest; WXT's fake browser mocks chrome.* APIs
npm run build
```

Exact commands depend on your `package.json`. Unit-test the pure logic: unit conversion, streak and average, quiet-hours checks and interval validation.

**Manual QA in the real browser**

- Load the build via `chrome://extensions` and `edge://extensions` → Developer mode → Load unpacked.
- Inspect the service worker to watch alarms fire and check storage.
- Leave the browser idle long enough for the service worker to sleep, then confirm the next reminder still fires.
- Click both notification buttons. Test quiet hours and every pause option.

Playwright can load an unpacked extension in Chromium to automate popup flows, such as logging a drink and checking that the ring updates.

**Review AI-generated code**

"It compiled" doesn't mean it's correct. Ask:

```
Review the implementation against PRD.md, ARCHITECTURE.md,
DESIGN.md, RULES.md, TEST_PLAN.md and SECURITY.md.

Check: correctness, use of chrome.alarms (no timers),
storage split (sync vs local), permissions, privacy,
accessibility, duplication.

Do not modify anything yet. Report all issues first.
```

Then fix issues one by one.

**Debug with structure**

```
ERROR
[paste the error from the service worker console]

EXPECTED
Water reminder fires every 45 minutes.

ACTUAL
No reminder after the browser sits idle for an hour.

STEPS TO REPRODUCE
1. Set interval to 45 min
2. Leave the browser idle
3. No notification appears

CONSTRAINT
Do not add permissions.

Do not modify code yet. Find the root cause and explain:
1. What is failing? 2. Why? 3. Which file?
4. Smallest fix? 5. How will we test it?
```

Then: "Implement the smallest fix. Do not refactor unrelated code. Run the relevant tests."

**Commit after every working feature**

```bash
git status
git add .
git commit -m "feat: add snooze and i-drank notification actions"
git push
```

Use branches such as `feature/reminders`, `feature/intake`, `feature/history` and `fix/snooze-reschedule`.

## Step 24–26: Publish and maintain

**Pre-publish checklist**

Functionality

- [ ] Water reminders at every preset and a custom interval
- [ ] Break reminders (20-20-20 and Pomodoro)
- [ ] Snooze and "I drank" on the notification
- [ ] Logging, progress ring, ml / oz toggle
- [ ] 7-day history, average and streak
- [ ] Quiet hours, pause options, auto-pause when idle
- [ ] Chime on and off; persistent and banner styles

UI

- [ ] Popup and options page follow DESIGN.md
- [ ] Empty states
- [ ] Keyboard navigation and accessible labels
- [ ] Windows Focus Assist / Do Not Disturb note on the settings page

Privacy

- [ ] Only the five listed permissions in the manifest
- [ ] No network requests
- [ ] Settings in storage.sync, logs in storage.local

Code

- [ ] Lint, type check and tests pass
- [ ] Production build passes in Chrome and Edge

**Publish**

Local → load unpacked in Chrome and Edge → QA → store submission. Never make the stores your first test.

```bash
npm run zip
```

| Store | Cost | Upload |
| --- | --- | --- |
| Chrome Web Store | One-time $5 developer registration fee | Production `.zip` |
| Microsoft Edge Add-ons | Free to publish | The same `.zip` |

Keep the permission list minimal. Fewer permissions mean faster review and more user trust. In the listing, state plainly that all data stays on the device.

**After launch**

Install the published version from each store and run the test plan again, not just the local build. Then loop: monitor → collect feedback (store reviews and ratings) → fix → test → publish an update.

Keep TASKS.md, MEMORY.md, DECISIONS.md, README.md and ARCHITECTURE.md current. The AI needs accurate context.

## Final project structure and the loop

```
hydrately/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── TEST_PLAN.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   └── MEMORY.md
├── .cursor/
│   └── rules/
│       ├── general.mdc
│       ├── extension.mdc
│       ├── ui.mdc
│       └── testing.mdc
├── entrypoints/
│   ├── background.ts
│   ├── popup/
│   ├── options/
│   └── offscreen/
├── components/
├── stores/
├── services/
├── types/
├── utils/
├── tests/
├── public/            # icons, chime audio
├── RULES.md
├── TASKS.md
├── README.md
├── wxt.config.ts
└── package.json
```

Short on time? Start with only PRD.md, RULES.md, TASKS.md and README.md, then add the rest as the extension grows.

**The vibe coding loop, for every task**

1. Read
2. Understand
3. Plan
4. Implement
5. Test in Chrome and Edge
6. Review
7. Fix
8. Commit
9. Update documentation

Then move to the next task.
