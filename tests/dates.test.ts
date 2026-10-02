import { describe, expect, it } from 'vitest';
import {
  dateKey,
  dayInitial,
  formatClock,
  formatDuration,
  lastDays,
  minutesUntil,
  parseTimeOfDay,
} from '@/utils/dates';

describe('dateKey', () => {
  it('uses the local calendar day, zero padded', () => {
    expect(dateKey(new Date(2026, 9, 2, 23, 59))).toBe('2026-10-02');
    expect(dateKey(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05');
  });
});

describe('lastDays', () => {
  it('returns the days oldest first, ending today', () => {
    const days = lastDays(7, new Date(2026, 9, 2, 15, 30));
    expect(days.map((day) => dateKey(day))).toEqual([
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });

  it('labels each day with its initial', () => {
    // 2 October 2026 is a Friday.
    const labels = lastDays(7, new Date(2026, 9, 2)).map(dayInitial);
    expect(labels).toEqual(['S', 'S', 'M', 'T', 'W', 'T', 'F']);
  });
});

describe('formatDuration', () => {
  it('writes numbers with their unit', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 h');
    expect(formatDuration(90)).toBe('1 h 30 min');
    expect(formatDuration(240)).toBe('4 h');
  });
});

describe('formatClock', () => {
  it('uses a 12-hour clock', () => {
    expect(formatClock(new Date(2026, 9, 2, 11, 40))).toBe('11:40 AM');
    expect(formatClock(new Date(2026, 9, 2, 20, 5))).toBe('8:05 PM');
  });
});

describe('parseTimeOfDay', () => {
  it('returns minutes since midnight', () => {
    expect(parseTimeOfDay('00:00')).toBe(0);
    expect(parseTimeOfDay('08:30')).toBe(510);
    expect(parseTimeOfDay('23:59')).toBe(1439);
  });

  it('rejects malformed times', () => {
    for (const value of ['', '8:00', '24:00', '12:60', '12:5', 'noon']) {
      expect(parseTimeOfDay(value)).toBeNull();
    }
  });
});

describe('minutesUntil', () => {
  it('rounds up and never goes negative', () => {
    const now = Date.UTC(2026, 9, 2, 12, 0, 0);
    expect(minutesUntil(now + 24 * 60_000, now)).toBe(24);
    expect(minutesUntil(now + 61_000, now)).toBe(2);
    expect(minutesUntil(now - 5_000, now)).toBe(0);
  });
});
