# Design System

Source of truth: the Hydrate.ly design system and the popup design on
claude.ai. This file is the working copy for the codebase.

- Design system: https://claude.ai/artifact/QEMQs93Kj2NdfJo9o6eJ2S
- Screens: https://claude.ai/artifact/WNucKjL62Mdn7diAKGqSRz

## Style
Simple, minimal, calm. No gradients. One accent, one typeface, white
cards on a cool off-white ground, and generous touch targets.

## Principles
- **One glance, one tap.** Today's progress is readable instantly and the
  most common action (log 250 ml) is one tap.
- **Water is the only colour.** `water` marks progress and water-related
  things. Everything else is ink and neutrals. Primary buttons are ink,
  not blue, so blue always means "water".
- **Calm, never nagging.** No red, no alarms, no guilt.
- **Private by design.** Say plainly that everything stays on the device.

## Surfaces
- Popup (360 px wide, at most 600 px tall): fixed 56 px header, scrolling
  content, fixed 60 px tab bar with Today, History and Settings.
- Options page: the same settings form as the popup's Settings tab.
- Notification: title, custom message, two buttons.

## Popup screens
**Today**
1. Progress ring with today's total / goal (e.g. 1,250 of 2,500 ml) and a
   status line ("50% · 1,250 ml to go", "Goal reached. Nice work.")
2. Quick log: +250 ml, +500 ml, Custom
3. Toast after a log: "Logged 250 ml" with Undo
4. Up next: water and break countdowns, with Pause / Resume

**History**
1. 7-day bar chart with a dashed goal line
2. Daily average and streak tiles
3. Today's log, with a remove button per entry

**Settings**: Water reminders, Break reminders, Notifications, Daily
goal, Focus, then the privacy line.

**Sheets**: Pause reminders (30 minutes, 1 hour, Until tomorrow) and Log
a custom amount (100, 150, 330, 750 ml, or type one). Overlays are
bottom sheets with a scrim, never centred modals.

## Colors
Defined as Tailwind theme variables in `assets/styles/main.css`
(`--color-*`), so `bg-surface`, `text-ink-muted`, `border-line` and so on
read from one place. Dark values apply with `prefers-color-scheme: dark`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| bg | #F6F9FB | #0D151C | Popup background |
| surface | #FFFFFF | #16212A | Cards, buttons, inputs, tab bar, sheets |
| surface-muted | #F3F7FA | #1B2731 | Neutral icon tiles, quick amounts |
| surface-sunken | #EEF3F6 | #0F1A22 | Segmented control track |
| ink | #0E1A24 | #EAF1F6 | Primary text, numbers, today's bar |
| ink-body | #3D4E5B | #C3D0DA | Body text |
| ink-muted | #5A6B78 | #93A6B4 | Secondary text, labels, inactive tabs |
| ink-subtle | #8396A4 | #6E8291 | Low-emphasis icons only, never text |
| line | #E1E9EE | #26343F | Card and button borders |
| line-soft | #EDF2F5 | #1F2C36 | Dividers inside a card |
| line-strong | #D3DEE6 | #33434F | Input borders, grip, goal line |
| water | #1A9BE0 | #3AAEEC | The accent: ring, drop, switch on, met-goal bars. Graphics only |
| water-text | #0B6FA8 | #6CC3F2 | Accent text: status line, Pause, Undo, active tab |
| water-tint | #E8F4FB | #12324A | Water icon tiles, Logged toast |
| water-soft | #BFDDEF | #1F4A66 | Bars for days under goal |
| track | #E2EAF0 | #23313C | Unfilled part of the ring |
| primary | #0E1A24 | #EAF1F6 | Primary button, selected interval chip |
| on-primary | #FFFFFF | #0E1A24 | Text on primary |
| switch-off | #C3D0D9 | #3A4A57 | Switch track when off |
| scrim | rgba(14,26,36,.42) | rgba(0,0,0,.6) | Behind a bottom sheet |
| focus | = water | = water | 2 px focus ring, 2 px offset |

## Typography
Figtree (variable, weights 400–800), bundled with the extension through
`@fontsource-variable/figtree`. Never load it from Google Fonts: the
extension makes no network requests. Fallback: the system font stack.

| Class | Size | Use |
| --- | --- | --- |
| text-ring | 40 px / 700 | Number inside the ring |
| text-stat | 22 px / 700 | Stat tiles |
| text-heading | 18 px / 700–800 | Wordmark, sheet titles |
| text-title | 15 px / 700 | Card titles, row values |
| text-body | 14 px / 600 | Row titles, button labels, inputs |
| text-label | 13 px / 600 | Field labels, status line, chips |
| text-caption | 12 px | Sublabels, helper text |
| text-tab | 11 px / 600 | Tab bar labels |

Numbers use `tabular-nums` so they don't jitter.

## Spacing, radius, size
- 16 px gutter in the popup; 12 px between cards; 8 px inside grids.
- Radius: 8 (`sm`), 10 (`md`, icon tiles), 12 (`lg`, inputs, buttons,
  chips), 14 (`xl`, quick-add), 16 (`2xl`, cards), 20 (`sheet`).
- Anything clickable is at least 44 px tall. Quick-add buttons are 64 px.
- No shadows on cards. Shadows are only for things that float: sheets and
  the selected segment.

## Components
- Buttons: primary (ink fill), secondary (outline), ghost (accent text)
- Cards: 16 px radius, 1 px border, 16 px padding
- ProgressRing and HistoryBars: hand-written SVG
- QuickAdd, LoggedToast, UpNextCard, LogList
- BottomSheet (PauseSheet, CustomAmountSheet)
- SegmentedControl, SwitchRow, interval chips, text and number fields
- AppIcon: inline 24×24 stroke icons; the drop is the only filled glyph

## Voice and copy
- Short, plain, sentence case: "Log a custom amount", "Pause reminders".
- Buttons say what happens: Log, Pause, Snooze 10 min, I drank 250 ml.
- Confirm in past tense: "Logged 250 ml".
- Numbers carry their unit with a space: `250 ml`, `8 oz`, `45 min`,
  `1 h 30 min`. Thousands get a comma: `2,500 ml`.
- No emoji, no exclamation marks.

## Notifications
The OS draws the notification; we set the copy and the buttons.

| Reminder | Title | Message | Buttons |
| --- | --- | --- | --- |
| Water | Time for a sip | Custom message + "1,250 of 2,500 ml so far." | I drank 250 ml / Snooze 10 min |
| Eye break | Eye break · 20 seconds | Look at something about 20 feet away for 20 seconds. | Done / Snooze 5 min |
| Pomodoro | Break time · 5 minutes | Stand up, stretch and rest your eyes. | Done / Snooze 5 min |
| Pomodoro, 4th round | Long break · 15 minutes | 4 rounds done. Step away from the screen for a while. | Done / Snooze 5 min |

Banner style uses the default timeout. Persistent style sets
`requireInteraction: true`.

## UX requirements
- Fixed popup width; no horizontal scroll
- Empty states: no drinks logged today; nothing logged in the last 7 days
- Show units the user picked (ml or oz) everywhere
- Accessible: real buttons and labelled inputs, keyboard navigation,
  visible focus, switches as `role="switch"` checkboxes, text at 4.5:1
- Motion: ring fill eases over 0.6 s; switches 0.2 s; both are skipped
  with `prefers-reduced-motion`
- Settings page includes a note: on Windows, Focus Assist or
  Do Not Disturb hides reminders, though the chime can still play
- Errors are calm and recoverable: a failed save shows a dismissible
  notice and puts the control back; a failed load shows "Couldn't load
  your data" with Try again instead of a blank popup
