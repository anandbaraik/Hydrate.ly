import type { PauseOption, Settings } from '@/types';
import { DEFAULT_WAKE_TIME } from './constants';
import { addMinutes, parseTimeOfDay } from './dates';

type WakeSettings = Pick<Settings, 'quietHoursEnabled' | 'quietTo'>;

/** Epoch milliseconds at which a pause started `now` ends. */
export function pauseUntil(option: PauseOption, now: Date, settings: WakeSettings): number {
  if (option === '30min') return addMinutes(now, 30).getTime();
  if (option === '1hour') return addMinutes(now, 60).getTime();

  // "Until tomorrow" ends at the next wake time: when quiet hours end, or
  // 8:00 AM. After midnight that is this morning, not the day after.
  const wake = settings.quietHoursEnabled ? settings.quietTo : DEFAULT_WAKE_TIME;
  const wakeMinutes = parseTimeOfDay(wake) ?? parseTimeOfDay(DEFAULT_WAKE_TIME)!;

  // setHours and setDate keep the wall-clock time across a DST change.
  const until = new Date(now);
  until.setHours(Math.floor(wakeMinutes / 60), wakeMinutes % 60, 0, 0);
  if (until.getTime() <= now.getTime()) until.setDate(until.getDate() + 1);
  return until.getTime();
}

export function isPaused(pausedUntil: number | null, now: number): boolean {
  return pausedUntil !== null && pausedUntil > now;
}
