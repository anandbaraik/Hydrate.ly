import { minutesOfDay, parseTimeOfDay } from './dates';

/**
 * True when `now` falls inside the quiet window. The window may cross
 * midnight (20:00 to 08:00). An empty or malformed window is never quiet.
 */
export function isWithinQuietHours(now: Date, from: string, to: string): boolean {
  const start = parseTimeOfDay(from);
  const end = parseTimeOfDay(to);
  if (start === null || end === null || start === end) return false;

  const current = minutesOfDay(now);
  return start < end ? current >= start && current < end : current >= start || current < end;
}
