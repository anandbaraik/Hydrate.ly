import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { nextFireTime } from '@/services/alarms';
import { playChime } from '@/services/chime';
import { queryIdleState } from '@/services/idle';
import { clearReminder, showReminder } from '@/services/notifications';
import {
  handleAlarm,
  handleBrowserStartup,
  handleIdleChange,
  handleReminderButton,
  handleSettingsChange,
  initReminders,
  logDrink,
  pauseReminders,
} from '@/services/reminders';
import { getEntries, getRuntime, getSettings, saveSettings, setRuntime } from '@/services/storage';

// The fake browser covers storage and alarms. Idle, audio and the OS
// notification itself are replaced with mocks.
vi.mock('@/services/idle', () => ({ queryIdleState: vi.fn(), watchIdleState: vi.fn() }));
vi.mock('@/services/chime', () => ({ playChime: vi.fn() }));
vi.mock('@/services/notifications', () => ({ showReminder: vi.fn(), clearReminder: vi.fn() }));

const MINUTE = 60_000;
const midday = new Date(2026, 9, 2, 12, 0);
const night = new Date(2026, 9, 2, 22, 0);

/** Minutes from the current fake time until the alarm fires. */
async function minutesToNext(kind: 'water' | 'break'): Promise<number | null> {
  const at = await nextFireTime(kind);
  return at === null ? null : Math.round((at - Date.now()) / MINUTE);
}

beforeEach(() => {
  fakeBrowser.reset();
  vi.useFakeTimers({ now: midday, toFake: ['Date'] });
  vi.mocked(queryIdleState).mockResolvedValue('active');
});

describe('initReminders', () => {
  it('schedules water and break alarms from the default settings', async () => {
    await initReminders();
    expect(await minutesToNext('water')).toBe(45);
    expect(await minutesToNext('break')).toBe(20);
  });

  it('leaves a correct alarm alone, so its countdown is not reset', async () => {
    await initReminders();
    vi.setSystemTime(midday.getTime() + 10 * MINUTE);
    await initReminders();
    expect(await minutesToNext('water')).toBe(35);
  });

  it('schedules no break alarm when breaks are off', async () => {
    await saveSettings({ breaksEnabled: false });
    await initReminders();
    expect(await nextFireTime('break')).toBeNull();
  });
});

describe('handleAlarm: water', () => {
  it('shows the reminder with progress and plays the chime', async () => {
    await logDrink(1250, 'popup');
    expect(await handleAlarm('water', midday)).toBeNull();

    expect(showReminder).toHaveBeenCalledWith(
      'water',
      {
        title: 'Time for a sip',
        message: 'Small sips, better focus. 1,250 of 2,500 ml so far.',
        buttons: ['I drank 250 ml', 'Snooze 10 min'],
      },
      false,
    );
    expect(playChime).toHaveBeenCalledTimes(1);
  });

  it('uses the custom message and persistent style', async () => {
    await saveSettings({ message: 'Water break!', notificationStyle: 'persistent' });
    await handleAlarm('water', midday);

    const [, content, persistent] = vi.mocked(showReminder).mock.calls[0]!;
    expect(content.message).toBe('Water break! 0 of 2,500 ml so far.');
    expect(persistent).toBe(true);
  });

  it('stays silent when the chime is off', async () => {
    await saveSettings({ chime: false });
    await handleAlarm('water', midday);
    expect(showReminder).toHaveBeenCalledTimes(1);
    expect(playChime).not.toHaveBeenCalled();
  });

  it('shows nothing during quiet hours', async () => {
    expect(await handleAlarm('water', night)).toBe('quiet-hours');
    expect(showReminder).not.toHaveBeenCalled();
    expect(playChime).not.toHaveBeenCalled();
  });

  it('shows nothing while paused', async () => {
    await pauseReminders(midday.getTime() + 30 * MINUTE);
    expect(await handleAlarm('water', midday)).toBe('paused');
    expect(showReminder).not.toHaveBeenCalled();
  });

  it('shows nothing while the user is away, and remembers it', async () => {
    vi.mocked(queryIdleState).mockResolvedValue('idle');
    expect(await handleAlarm('water', midday)).toBe('away');
    expect(showReminder).not.toHaveBeenCalled();
    expect((await getRuntime()).skippedWhileAway).toBe(true);
  });

  it('does not check idle state when auto-pause is off', async () => {
    await saveSettings({ autoPauseWhenAway: false });
    vi.mocked(queryIdleState).mockResolvedValue('idle');
    expect(await handleAlarm('water', midday)).toBeNull();
    expect(queryIdleState).not.toHaveBeenCalled();
  });
});

describe('handleAlarm: break', () => {
  it('shows the 20-20-20 eye break', async () => {
    await handleAlarm('break', midday);
    const [kind, content] = vi.mocked(showReminder).mock.calls[0]!;
    expect(kind).toBe('break');
    expect(content.title).toBe('Eye break · 20 seconds');
    expect(content.buttons).toEqual(['Done', 'Snooze 5 min']);
  });

  it('clears the alarm instead of notifying when breaks are off', async () => {
    await initReminders();
    await fakeBrowser.storage.sync.set({ settings: { ...(await getSettings()), breaksEnabled: false } });
    expect(await handleAlarm('break', midday)).toBe('disabled');
    expect(showReminder).not.toHaveBeenCalled();
    expect(await nextFireTime('break')).toBeNull();
  });

  it('runs Pomodoro rounds with a long break every fourth', async () => {
    await saveSettings({ breakMode: 'pomodoro' });

    for (const round of [1, 2, 3]) {
      await handleAlarm('break', midday);
      expect((await getRuntime()).pomodoroRound).toBe(round);
      // 5 minute break plus the next 25 minute focus block.
      expect(await minutesToNext('break')).toBe(30);
    }
    expect(vi.mocked(showReminder).mock.calls[2]![1].title).toBe('Break time · 5 minutes');

    await handleAlarm('break', midday);
    expect(vi.mocked(showReminder).mock.calls[3]![1].title).toBe('Long break · 15 minutes');
    expect(await minutesToNext('break')).toBe(40);
  });

  it('counts no round for a suppressed break, and starts a fresh focus block', async () => {
    await saveSettings({ breakMode: 'pomodoro' });
    await setRuntime({ pomodoroRound: 3 });

    expect(await handleAlarm('break', night)).toBe('quiet-hours');
    expect(showReminder).not.toHaveBeenCalled();
    expect((await getRuntime()).pomodoroRound).toBe(0);
    // The one-shot alarm is still rescheduled: 25 minutes of focus.
    expect(await minutesToNext('break')).toBe(25);
  });

  it('does not hand out a long break after a pause', async () => {
    await saveSettings({ breakMode: 'pomodoro' });
    await pauseReminders(midday.getTime() + 60 * MINUTE);
    for (let i = 0; i < 3; i++) await handleAlarm('break', midday);

    const afterPause = new Date(midday.getTime() + 90 * MINUTE);
    await handleAlarm('break', afterPause);
    expect(vi.mocked(showReminder).mock.calls[0]![1].title).toBe('Break time · 5 minutes');
    expect((await getRuntime()).pomodoroRound).toBe(1);
  });

  it('remembers a break skipped while away in Pomodoro mode', async () => {
    await saveSettings({ breakMode: 'pomodoro' });
    vi.mocked(queryIdleState).mockResolvedValue('locked');
    expect(await handleAlarm('break', midday)).toBe('away');
    expect(await getRuntime()).toMatchObject({ skippedWhileAway: true, pomodoroRound: 0 });
  });
});

describe('handleBrowserStartup', () => {
  it('starts a fresh Pomodoro cycle and restores the alarms', async () => {
    await saveSettings({ breakMode: 'pomodoro' });
    await setRuntime({ pomodoroRound: 3, breakSnoozed: true });

    await handleBrowserStartup();
    expect(await getRuntime()).toMatchObject({ pomodoroRound: 0, breakSnoozed: false });
    expect(await minutesToNext('water')).toBe(45);
    expect(await minutesToNext('break')).toBe(25);
  });

  it('keeps a pause that is still running', async () => {
    const until = midday.getTime() + 30 * MINUTE;
    await pauseReminders(until);
    await handleBrowserStartup();
    expect((await getRuntime()).pausedUntil).toBe(until);
  });
});

describe('handleReminderButton', () => {
  it('"I drank" logs 250 ml from the reminder and clears the notification', async () => {
    await handleReminderButton('water', 0);

    expect(clearReminder).toHaveBeenCalledWith('water');
    const entries = await getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ ml: 250, source: 'reminder' });
  });

  it('"I drank" restarts the water countdown from a full interval', async () => {
    await initReminders();
    vi.setSystemTime(midday.getTime() + 40 * MINUTE);
    await handleReminderButton('water', 0);
    expect(await minutesToNext('water')).toBe(45);
  });

  it('Snooze brings the water reminder back in 10 minutes, without logging', async () => {
    await initReminders();
    await handleReminderButton('water', 1);

    expect(clearReminder).toHaveBeenCalledWith('water');
    expect(await minutesToNext('water')).toBe(10);
    expect(await getEntries()).toEqual([]);
  });

  it('Snooze brings the break reminder back in 5 minutes', async () => {
    await initReminders();
    await handleReminderButton('break', 1);
    expect(await minutesToNext('break')).toBe(5);
  });

  it('Done on a break only clears the notification', async () => {
    await initReminders();
    await handleReminderButton('break', 0);
    expect(clearReminder).toHaveBeenCalledWith('break');
    expect(await minutesToNext('break')).toBe(20);
  });

  it('a snoozed Pomodoro break repeats its round instead of counting a new one', async () => {
    await saveSettings({ breakMode: 'pomodoro' });
    await handleAlarm('break', midday);
    await handleReminderButton('break', 1);
    await handleAlarm('break', midday);

    expect((await getRuntime()).pomodoroRound).toBe(1);
    expect(showReminder).toHaveBeenCalledTimes(2);
  });
});

describe('handleSettingsChange', () => {
  it('reschedules water when the interval changes', async () => {
    await initReminders();
    const previous = await getSettings();
    const next = await saveSettings({ waterIntervalMin: 90 });
    await handleSettingsChange(next, previous);
    expect(await minutesToNext('water')).toBe(90);
  });

  it('leaves the alarms alone for unrelated changes', async () => {
    await initReminders();
    vi.setSystemTime(midday.getTime() + 10 * MINUTE);
    const previous = await getSettings();
    const next = await saveSettings({ goalMl: 3000, chime: false });
    await handleSettingsChange(next, previous);
    expect(await minutesToNext('water')).toBe(35);
    expect(await minutesToNext('break')).toBe(10);
  });

  it('clears the break alarm when breaks are turned off, and restores it when on', async () => {
    await initReminders();
    const on = await getSettings();
    const off = await saveSettings({ breaksEnabled: false });
    await handleSettingsChange(off, on);
    expect(await nextFireTime('break')).toBeNull();

    await handleSettingsChange(on, off);
    expect(await minutesToNext('break')).toBe(20);
  });

  it('starts a fresh Pomodoro cycle when the break style changes', async () => {
    await initReminders();
    await setRuntime({ pomodoroRound: 3 });
    const previous = await getSettings();
    const next = await saveSettings({ breakMode: 'pomodoro' });
    await handleSettingsChange(next, previous);

    expect(await minutesToNext('break')).toBe(25);
    expect((await getRuntime()).pomodoroRound).toBe(0);
  });
});

describe('handleIdleChange', () => {
  it('restarts the countdowns when the user returns after a skipped reminder', async () => {
    await initReminders();
    vi.mocked(queryIdleState).mockResolvedValue('idle');
    await handleAlarm('water', midday);

    vi.setSystemTime(midday.getTime() + 50 * MINUTE);
    await handleIdleChange('active');

    expect(await minutesToNext('water')).toBe(45);
    expect((await getRuntime()).skippedWhileAway).toBe(false);
  });

  it('does not push reminders back after a brief idle spell', async () => {
    await initReminders();
    vi.setSystemTime(midday.getTime() + 10 * MINUTE);
    await handleIdleChange('active');
    expect(await minutesToNext('water')).toBe(35);
  });

  it('does nothing when the user goes idle', async () => {
    await initReminders();
    await setRuntime({ skippedWhileAway: true });
    await handleIdleChange('idle');
    expect((await getRuntime()).skippedWhileAway).toBe(true);
  });
});
