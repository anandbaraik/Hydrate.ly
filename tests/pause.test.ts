import { describe, expect, it } from 'vitest';
import { isPaused, pauseUntil } from '@/utils/pause';

const now = new Date(2026, 9, 2, 11, 40);
const quietOn = { quietHoursEnabled: true, quietTo: '07:30' };
const quietOff = { quietHoursEnabled: false, quietTo: '07:30' };

describe('pauseUntil', () => {
  it('pauses for 30 minutes', () => {
    expect(new Date(pauseUntil('30min', now, quietOn))).toEqual(new Date(2026, 9, 2, 12, 10));
  });

  it('pauses for 1 hour', () => {
    expect(new Date(pauseUntil('1hour', now, quietOn))).toEqual(new Date(2026, 9, 2, 12, 40));
  });

  it('pauses until quiet hours end tomorrow', () => {
    expect(new Date(pauseUntil('tomorrow', now, quietOn))).toEqual(new Date(2026, 9, 3, 7, 30));
  });

  it('pauses until 8:00 AM tomorrow when quiet hours are off', () => {
    expect(new Date(pauseUntil('tomorrow', now, quietOff))).toEqual(new Date(2026, 9, 3, 8, 0));
  });

  it('resumes this morning, not the day after, when pressed after midnight', () => {
    const lateNight = new Date(2026, 9, 3, 1, 0);
    expect(new Date(pauseUntil('tomorrow', lateNight, quietOn))).toEqual(new Date(2026, 9, 3, 7, 30));
    expect(new Date(pauseUntil('tomorrow', lateNight, quietOff))).toEqual(new Date(2026, 9, 3, 8, 0));
  });

  it('moves to the next day once the wake time has passed', () => {
    const atWake = new Date(2026, 9, 2, 7, 30);
    expect(new Date(pauseUntil('tomorrow', atWake, quietOn))).toEqual(new Date(2026, 9, 3, 7, 30));
  });

  it('keeps the wall-clock wake time across a month boundary', () => {
    const lastDay = new Date(2026, 9, 31, 22, 0);
    expect(new Date(pauseUntil('tomorrow', lastDay, quietOn))).toEqual(new Date(2026, 10, 1, 7, 30));
  });
});

describe('isPaused', () => {
  it('is paused only while the end time is in the future', () => {
    const time = now.getTime();
    expect(isPaused(null, time)).toBe(false);
    expect(isPaused(time + 1, time)).toBe(true);
    expect(isPaused(time, time)).toBe(false);
    expect(isPaused(time - 1, time)).toBe(false);
  });
});
