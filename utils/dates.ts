// Date helpers. Everything here works in the user's local time zone, because
// "today", quiet hours and the 7-day history are all about their own clock.

const MS_PER_MINUTE = 60_000;
/** Indexed by Date.getDay(), which starts the week on Sunday. */
const DAY_INITIALS = 'SMTWTFS';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as "YYYY-MM-DD". Sorts correctly as a string. */
export function dateKey(date: Date | number): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local midnight at the start of the given day. */
export function startOfDay(date: Date | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Moves by whole calendar days. Uses setDate rather than adding 24 hours,
 * because a day is 23 or 25 hours long when the clocks change.
 */
export function addDays(date: Date | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** The last `count` local days, oldest first, ending today. */
export function lastDays(count: number, now: Date | number): Date[] {
  const today = startOfDay(now);
  return Array.from({ length: count }, (_, i) => addDays(today, i - (count - 1)));
}

/** "M" for a Monday. Used as the label under each history bar. */
export function dayInitial(date: Date): string {
  return DAY_INITIALS.charAt(date.getDay());
}

/** "11:40 AM". */
export function formatClock(date: Date | number): string {
  return (
    new Date(date)
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      // Newer browsers put a narrow no-break space before AM/PM. A plain
      // space keeps labels, aria text and tests the same everywhere.
      .replace(/\u202f/g, ' ')
  );
}

/** "45 min", "1 h", "1 h 30 min". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Minutes since midnight for "HH:MM", or null when malformed. */
export function parseTimeOfDay(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Minutes since local midnight, to compare against parseTimeOfDay(). */
export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Whole minutes from `now` until `timestamp`, rounded up, never negative. */
export function minutesUntil(timestamp: number, now: number): number {
  return Math.max(0, Math.ceil((timestamp - now) / MS_PER_MINUTE));
}

/** Moves by elapsed minutes. For calendar days use addDays() instead. */
export function addMinutes(date: Date | number, minutes: number): Date {
  return new Date(new Date(date).getTime() + minutes * MS_PER_MINUTE);
}
