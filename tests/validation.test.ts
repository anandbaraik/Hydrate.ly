import { describe, expect, it } from 'vitest';
import { DEFAULT_MESSAGE, DEFAULT_SETTINGS } from '@/utils/constants';
import {
  clampGoalMl,
  clampInterval,
  isValidAmountMl,
  isValidInterval,
  isValidTimeOfDay,
  sanitizeEntries,
  sanitizeMessage,
  sanitizeRuntime,
  sanitizeSettings,
} from '@/utils/validation';

describe('water interval', () => {
  it('accepts 15 minutes to 4 hours only', () => {
    expect(isValidInterval(15)).toBe(true);
    expect(isValidInterval(240)).toBe(true);
    expect(isValidInterval(14)).toBe(false);
    expect(isValidInterval(241)).toBe(false);
    expect(isValidInterval(45.5)).toBe(false);
    expect(isValidInterval('45')).toBe(false);
  });

  it('clamps out-of-range values', () => {
    expect(clampInterval(5)).toBe(15);
    expect(clampInterval(999)).toBe(240);
    expect(clampInterval(44.6)).toBe(45);
    expect(clampInterval(Number.NaN)).toBe(DEFAULT_SETTINGS.waterIntervalMin);
  });
});

describe('amounts', () => {
  it('accepts 1 to 5,000 ml', () => {
    expect(isValidAmountMl(1)).toBe(true);
    expect(isValidAmountMl(5000)).toBe(true);
    expect(isValidAmountMl(0)).toBe(false);
    expect(isValidAmountMl(-250)).toBe(false);
    expect(isValidAmountMl(5001)).toBe(false);
    expect(isValidAmountMl(Number.NaN)).toBe(false);
    expect(isValidAmountMl('250')).toBe(false);
  });

  it('clamps the daily goal', () => {
    expect(clampGoalMl(0)).toBe(250);
    expect(clampGoalMl(50_000)).toBe(10_000);
    expect(clampGoalMl(2514.4)).toBe(2514);
  });
});

describe('time of day', () => {
  it('accepts 24-hour HH:MM only', () => {
    expect(isValidTimeOfDay('20:00')).toBe(true);
    expect(isValidTimeOfDay('8:00')).toBe(false);
    expect(isValidTimeOfDay('25:00')).toBe(false);
    expect(isValidTimeOfDay(800)).toBe(false);
  });
});

describe('sanitizeMessage', () => {
  it('trims and collapses whitespace', () => {
    expect(sanitizeMessage('  Drink   up  ')).toBe('Drink up');
  });

  it('strips control characters and line breaks', () => {
    expect(sanitizeMessage('Drink\n\tup\u0000now')).toBe('Drink up now');
  });

  it('keeps markup as plain text', () => {
    expect(sanitizeMessage('<b>Sip</b> & relax')).toBe('<b>Sip</b> & relax');
  });

  it('caps the length at 80 characters', () => {
    expect(sanitizeMessage('a'.repeat(200))).toHaveLength(80);
  });

  it('does not cut through an emoji at the limit', () => {
    const drop = String.fromCodePoint(0x1f4a7);
    // The emoji takes two UTF-16 units and would straddle the 80 limit.
    expect(sanitizeMessage('a'.repeat(79) + drop)).toBe('a'.repeat(79));
    expect(sanitizeMessage('a'.repeat(78) + drop)).toBe('a'.repeat(78) + drop);
  });

  it('falls back to the default when empty or not a string', () => {
    expect(sanitizeMessage('   ')).toBe(DEFAULT_MESSAGE);
    expect(sanitizeMessage(undefined)).toBe(DEFAULT_MESSAGE);
    expect(sanitizeMessage(42)).toBe(DEFAULT_MESSAGE);
  });
});

describe('sanitizeSettings', () => {
  it('returns the defaults for missing or malformed data', () => {
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('nope')).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings([])).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid values', () => {
    const custom = {
      ...DEFAULT_SETTINGS,
      waterIntervalMin: 90,
      breakMode: 'pomodoro',
      unit: 'oz',
      quietFrom: '22:15',
    };
    expect(sanitizeSettings(custom)).toEqual(custom);
  });

  it('replaces invalid values field by field', () => {
    const result = sanitizeSettings({
      waterIntervalMin: 5,
      breakMode: 'nap',
      unit: 'litres',
      goalMl: -1,
      quietFrom: '99:99',
      chime: 'yes',
      autoPauseWhenAway: false,
    });
    expect(result.waterIntervalMin).toBe(15);
    expect(result.breakMode).toBe(DEFAULT_SETTINGS.breakMode);
    expect(result.unit).toBe('ml');
    expect(result.goalMl).toBe(250);
    expect(result.quietFrom).toBe(DEFAULT_SETTINGS.quietFrom);
    expect(result.chime).toBe(DEFAULT_SETTINGS.chime);
    expect(result.autoPauseWhenAway).toBe(false);
  });
});

describe('sanitizeEntries', () => {
  it('drops malformed entries', () => {
    const good = { id: 'a', at: 1_790_000_000_000, ml: 250, source: 'popup' };
    expect(
      sanitizeEntries([
        good,
        { id: 'b', at: 1, ml: -5, source: 'popup' },
        { id: 'c', at: 'yesterday', ml: 250, source: 'popup' },
        { id: 'd', at: 1, ml: 250, source: 'elsewhere' },
        null,
      ]),
    ).toEqual([good]);
    expect(sanitizeEntries(undefined)).toEqual([]);
  });
});

describe('sanitizeRuntime', () => {
  it('defaults to not paused', () => {
    expect(sanitizeRuntime(undefined)).toEqual({
      pausedUntil: null,
      pomodoroRound: 0,
      breakSnoozed: false,
      skippedWhileAway: false,
    });
  });
});
