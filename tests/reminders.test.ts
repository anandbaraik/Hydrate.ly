import { describe, expect, it } from 'vitest';
import type { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/utils/constants';
import {
  breakNotification,
  pomodoroStep,
  suppressReason,
  waterNotification,
} from '@/utils/reminders';

const midday = new Date(2026, 9, 2, 12, 0);
const night = new Date(2026, 9, 2, 22, 0);
const settings = (patch: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, ...patch });

describe('suppressReason', () => {
  const base = { now: midday, settings: settings(), pausedUntil: null, idleState: 'active' } as const;

  it('shows the reminder when nothing is in the way', () => {
    expect(suppressReason(base)).toBeNull();
  });

  it('stays silent while paused', () => {
    expect(suppressReason({ ...base, pausedUntil: midday.getTime() + 60_000 })).toBe('paused');
  });

  it('shows again once the pause has ended', () => {
    expect(suppressReason({ ...base, pausedUntil: midday.getTime() - 1 })).toBeNull();
  });

  it('stays silent during quiet hours', () => {
    expect(suppressReason({ ...base, now: night })).toBe('quiet-hours');
  });

  it('ignores the quiet window when quiet hours are off', () => {
    const off = settings({ quietHoursEnabled: false });
    expect(suppressReason({ ...base, now: night, settings: off })).toBeNull();
  });

  it('stays silent while the user is away', () => {
    expect(suppressReason({ ...base, idleState: 'idle' })).toBe('away');
    expect(suppressReason({ ...base, idleState: 'locked' })).toBe('away');
  });

  it('ignores idle state when auto-pause is off', () => {
    const off = settings({ autoPauseWhenAway: false });
    expect(suppressReason({ ...base, idleState: 'idle', settings: off })).toBeNull();
  });
});

describe('pomodoroStep', () => {
  it('gives a 5 minute break after rounds 1 to 3', () => {
    expect(pomodoroStep(1)).toEqual({ round: 1, isLongBreak: false, breakMin: 5, nextDelayMin: 30 });
    expect(pomodoroStep(3).isLongBreak).toBe(false);
  });

  it('gives a 15 minute break every fourth round', () => {
    expect(pomodoroStep(4)).toEqual({ round: 4, isLongBreak: true, breakMin: 15, nextDelayMin: 40 });
    expect(pomodoroStep(8).isLongBreak).toBe(true);
    expect(pomodoroStep(5).isLongBreak).toBe(false);
  });
});

describe('waterNotification', () => {
  it('shows the custom message, progress and both actions', () => {
    expect(waterNotification(settings(), 1250)).toEqual({
      title: 'Time for a sip',
      message: 'Small sips, better focus. 1,250 of 2,500 ml so far.',
      buttons: ['I drank 250 ml', 'Snooze 10 min'],
    });
  });

  it('ends a custom message with a full stop before the progress', () => {
    const content = waterNotification(settings({ message: 'Drink up' }), 0);
    expect(content.message).toBe('Drink up. 0 of 2,500 ml so far.');
  });

  it('uses the unit the user picked', () => {
    const content = waterNotification(settings({ unit: 'oz' }), 1250);
    expect(content.message).toContain('42 of 85 oz so far.');
    expect(content.buttons[0]).toBe('I drank 8 oz');
  });
});

describe('breakNotification', () => {
  it('describes the 20-20-20 eye break', () => {
    expect(breakNotification(settings(), null)).toEqual({
      title: 'Eye break · 20 seconds',
      message: 'Look at something about 20 feet away for 20 seconds.',
      buttons: ['Done', 'Snooze 5 min'],
    });
  });

  it('describes short and long Pomodoro breaks', () => {
    const pomodoro = settings({ breakMode: 'pomodoro' });
    expect(breakNotification(pomodoro, pomodoroStep(1)).title).toBe('Break time · 5 minutes');
    expect(breakNotification(pomodoro, pomodoroStep(4)).title).toBe('Long break · 15 minutes');
  });
});
