# Test Plan

Run every section in both Chrome and Edge before publishing.

## Automated (every change)
```bash
npm run lint
npm run typecheck
npm test
npm run build
```
Unit tests cover unit conversion, date helpers, streak and average,
the progress label, quiet hours, pause, validation, the storage split,
overlapping writes and the reminder flow (alarm → suppress or notify →
Snooze / "I drank").

## Manual setup
1. `npm run build`
2. Open `chrome://extensions` (or `edge://extensions`), turn on
   Developer mode, choose Load unpacked and pick `.output/chrome-mv3`.
3. Open the service worker's console from the extension card to watch
   alarms and storage.

To fire a reminder without waiting, run this in the service worker
console (15 seconds; unpacked extensions are not held to the 30 second
minimum):
```js
chrome.alarms.create('hydrately:water', { when: Date.now() + 15000, periodInMinutes: 45 });
chrome.alarms.create('hydrately:break', { when: Date.now() + 15000, periodInMinutes: 20 });
```

## Reminders
- [ ] Water reminder fires at 30, 45, 60 min and at a custom interval
- [ ] Custom interval accepts 15 min to 4 hours only
- [ ] Reminders still fire after the browser has been idle
      (service worker asleep)
- [ ] Custom message appears in the notification
- [ ] Persistent notification stays; banner disappears
- [ ] Chime plays when on, stays silent when off
- [ ] Chime plays once when water and break reminders fire together
- [ ] 20-20-20 and Pomodoro break reminders fire correctly

## Quick actions
- [ ] "I drank" logs a drink and updates the progress ring
- [ ] Snooze delays the next reminder (10 min water, 5 min break)

## Intake
- [ ] 250 ml, 500 ml and custom amounts log correctly
- [ ] Undo removes the drink just logged
- [ ] Progress ring matches today's total / goal (default 2,500 ml)
- [ ] ml / oz toggle converts everywhere (ring, buttons, toast, history,
      settings, notification)

## History
- [ ] 7-day bars match logged totals
- [ ] Average and streak are correct
- [ ] Removing an entry updates the bars, the ring and the totals
- [ ] Empty state shows when nothing is logged today

## Focus-friendly
- [ ] No reminders during quiet hours
- [ ] Pause for 30 min, 1 hour, until tomorrow works
- [ ] "Until tomorrow" pressed after midnight resumes the same morning
- [ ] Resume ends a pause early
- [ ] With Focus Assist / Do Not Disturb on: the notification is hidden;
      note whether the chime still plays (expected, see ADR-022)
- [ ] Pomodoro: no "Long break" straight after a pause or quiet hours
- [ ] Auto-pause when idle; reminders resume on return

## Storage
- [ ] Settings sync to another signed-in browser
- [ ] Logs survive a browser restart
- [ ] Alarms are restored after a browser restart

## Accessibility
- [ ] Every control is reachable and usable with the keyboard
- [ ] Focus is visible; sheets trap focus and close with Esc
- [ ] Light and dark themes are both readable

## Browsers
- [ ] Chrome and Edge, Windows and macOS
- [ ] Windows Focus Assist / Do Not Disturb note is visible
