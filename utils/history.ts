import type { IntakeEntry } from '@/types';
import { HISTORY_DAYS, LOG_RETENTION_DAYS } from './constants';
import { addDays, dateKey, dayInitial, lastDays, startOfDay } from './dates';

export interface DayTotal {
  key: string;
  date: Date;
  /** Day initial: S, M, T, W, T, F, S. */
  label: string;
  ml: number;
  isToday: boolean;
}

/** Total millilitres per local day, keyed by "YYYY-MM-DD". */
export function totalsByDay(entries: IntakeEntry[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    const key = dateKey(entry.at);
    totals.set(key, (totals.get(key) ?? 0) + entry.ml);
  }
  return totals;
}

/** Entries logged on the same local day as `now`, newest first. */
export function entriesForDay(entries: IntakeEntry[], now: Date | number): IntakeEntry[] {
  const key = dateKey(now);
  return entries.filter((entry) => dateKey(entry.at) === key).sort((a, b) => b.at - a.at);
}

/** The last seven days, oldest first, ending today. */
export function weekTotals(entries: IntakeEntry[], now: Date | number): DayTotal[] {
  const totals = totalsByDay(entries);
  const todayKey = dateKey(now);
  return lastDays(HISTORY_DAYS, now).map((date) => {
    const key = dateKey(date);
    return {
      key,
      date,
      label: dayInitial(date),
      ml: totals.get(key) ?? 0,
      isToday: key === todayKey,
    };
  });
}

/**
 * Mean daily intake over the last seven days, rounded to 10 ml. Days before
 * the first ever log are left out, so a new user's average is not dragged
 * down by days they were not using the extension.
 */
export function dailyAverage(entries: IntakeEntry[], now: Date | number): number {
  if (entries.length === 0) return 0;
  const firstKey = dateKey(Math.min(...entries.map((entry) => entry.at)));
  const days = weekTotals(entries, now).filter((day) => day.key >= firstKey);
  if (days.length === 0) return 0;
  const mean = days.reduce((sum, day) => sum + day.ml, 0) / days.length;
  return Math.round(mean / 10) * 10;
}

/**
 * Consecutive days at or above the goal. Today counts once the goal is met,
 * and does not break the streak while it is still in progress.
 */
export function streak(entries: IntakeEntry[], goalMl: number, now: Date | number): number {
  if (goalMl <= 0) return 0;
  const totals = totalsByDay(entries);
  const met = (date: Date) => (totals.get(dateKey(date)) ?? 0) >= goalMl;

  const today = startOfDay(now);
  let count = met(today) ? 1 : 0;
  for (let day = addDays(today, -1); met(day); day = addDays(day, -1)) count++;
  return count;
}

/** Drops entries older than the retention window. */
export function pruneEntries(entries: IntakeEntry[], now: Date | number): IntakeEntry[] {
  const cutoff = addDays(startOfDay(now), -LOG_RETENTION_DAYS).getTime();
  return entries.filter((entry) => entry.at >= cutoff);
}
