import { describe, expect, it } from 'vitest';
import type { IntakeEntry } from '@/types';
import {
  dailyAverage,
  entriesForDay,
  pruneEntries,
  streak,
  weekTotals,
} from '@/utils/history';

const now = new Date(2026, 9, 2, 12, 0); // Friday 2 October 2026
let nextId = 0;

/** An entry `daysAgo` days before `now`, at the given hour. */
function entry(daysAgo: number, ml: number, hour = 9): IntakeEntry {
  const at = new Date(2026, 9, 2 - daysAgo, hour, 0).getTime();
  return { id: String(nextId++), at, ml, source: 'popup' };
}

describe('weekTotals', () => {
  it('sums each of the last seven days, oldest first', () => {
    const week = weekTotals([entry(0, 250), entry(0, 500, 10), entry(1, 2600), entry(6, 100)], now);
    expect(week.map((day) => day.ml)).toEqual([100, 0, 0, 0, 0, 2600, 750]);
    expect(week.map((day) => day.label)).toEqual(['S', 'S', 'M', 'T', 'W', 'T', 'F']);
  });

  it('marks only today', () => {
    const week = weekTotals([], now);
    expect(week.map((day) => day.isToday)).toEqual([false, false, false, false, false, false, true]);
  });

  it('ignores entries older than seven days', () => {
    const week = weekTotals([entry(7, 900)], now);
    expect(week.every((day) => day.ml === 0)).toBe(true);
  });
});

describe('entriesForDay', () => {
  it('returns only today, newest first', () => {
    const morning = entry(0, 250, 8);
    const midday = entry(0, 500, 11);
    expect(entriesForDay([morning, entry(1, 300), midday], now)).toEqual([midday, morning]);
  });
});

describe('dailyAverage', () => {
  it('is zero with nothing logged', () => {
    expect(dailyAverage([], now)).toBe(0);
  });

  it('averages all seven days for an established user', () => {
    const entries = [2100, 2600, 2500, 2800, 2550, 2650, 1250].map((ml, index) =>
      entry(6 - index, ml),
    );
    // 16,450 / 7 = 2,350
    expect(dailyAverage(entries, now)).toBe(2350);
  });

  it('counts only the days since the first log for a new user', () => {
    expect(dailyAverage([entry(0, 2000)], now)).toBe(2000);
    expect(dailyAverage([entry(1, 1000), entry(0, 2000)], now)).toBe(1500);
  });

  it('counts empty days after the first log', () => {
    expect(dailyAverage([entry(2, 3000)], now)).toBe(1000);
  });

  it('rounds to the nearest 10 ml', () => {
    expect(dailyAverage([entry(1, 1004), entry(0, 1000)], now)).toBe(1000);
    expect(dailyAverage([entry(1, 1010), entry(0, 1000)], now)).toBe(1010);
  });
});

describe('streak', () => {
  const goal = 2500;

  it('is zero with nothing logged', () => {
    expect(streak([], goal, now)).toBe(0);
  });

  it('counts consecutive past days at goal while today is in progress', () => {
    expect(streak([entry(2, 2500), entry(1, 2600), entry(0, 500)], goal, now)).toBe(2);
  });

  it('adds today once the goal is met', () => {
    expect(streak([entry(2, 2500), entry(1, 2600), entry(0, 2500)], goal, now)).toBe(3);
  });

  it('stops at the first missed day', () => {
    expect(streak([entry(3, 3000), entry(2, 1000), entry(1, 2600)], goal, now)).toBe(1);
  });

  it('is broken when yesterday was missed', () => {
    expect(streak([entry(2, 3000), entry(0, 500)], goal, now)).toBe(0);
  });

  it('runs past the seven-day window', () => {
    const entries = Array.from({ length: 12 }, (_, index) => entry(index + 1, goal));
    expect(streak(entries, goal, now)).toBe(12);
  });

  it('adds up several drinks in a day', () => {
    expect(streak([entry(1, 1500, 9), entry(1, 1000, 15)], goal, now)).toBe(1);
  });
});

describe('pruneEntries', () => {
  it('drops entries older than the retention window', () => {
    const recent = entry(10, 250);
    expect(pruneEntries([entry(400, 250), recent], now)).toEqual([recent]);
  });
});
