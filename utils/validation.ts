import type { IntakeEntry, RuntimeState, Settings } from '@/types';
import {
  AMOUNT_ML,
  DEFAULT_MESSAGE,
  DEFAULT_RUNTIME,
  DEFAULT_SETTINGS,
  GOAL_ML,
  MESSAGE_MAX_LENGTH,
  WATER_INTERVAL,
} from './constants';
import { parseTimeOfDay } from './dates';

// Validation for everything the user types and everything read back from
// storage. Stored data is never trusted: it may be missing on first run,
// written by an older version, or synced from another device.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Whole minutes from 15 to 240 (4 hours). */
export function isValidInterval(minutes: unknown): minutes is number {
  return (
    typeof minutes === 'number' &&
    Number.isInteger(minutes) &&
    minutes >= WATER_INTERVAL.min &&
    minutes <= WATER_INTERVAL.max
  );
}

/** Pulls any number into the allowed interval range; NaN becomes the default. */
export function clampInterval(minutes: number): number {
  if (!Number.isFinite(minutes)) return DEFAULT_SETTINGS.waterIntervalMin;
  return clamp(Math.round(minutes), WATER_INTERVAL.min, WATER_INTERVAL.max);
}

/** A single drink: more than nothing, and not an obvious typo. */
export function isValidAmountMl(ml: unknown): ml is number {
  return typeof ml === 'number' && Number.isFinite(ml) && ml >= AMOUNT_ML.min && ml <= AMOUNT_ML.max;
}

/** Pulls any number into the allowed goal range; NaN becomes the default. */
export function clampGoalMl(ml: number): number {
  if (!Number.isFinite(ml)) return GOAL_ML.default;
  return clamp(Math.round(ml), GOAL_ML.min, GOAL_ML.max);
}

/** 24-hour "HH:MM", the format a time input produces. */
export function isValidTimeOfDay(value: unknown): value is string {
  return typeof value === 'string' && parseTimeOfDay(value) !== null;
}

/**
 * Makes the custom message safe to hand to the notification API: plain text
 * only, no control characters, single-spaced and capped in length.
 */
export function sanitizeMessage(input: unknown): string {
  if (typeof input !== 'string') return DEFAULT_MESSAGE;
  const clean = input
    // Control characters and line or paragraph separators become spaces.
    .replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return truncate(clean, MESSAGE_MAX_LENGTH).trim() || DEFAULT_MESSAGE;
}

/** Shortens to at most `max` UTF-16 units without cutting through an emoji. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  let result = '';
  for (const { segment } of new Intl.Segmenter().segment(text)) {
    if (result.length + segment.length > max) break;
    result += segment;
  }
  return result;
}

/** Fills gaps and replaces invalid values with defaults. Never throws. */
export function sanitizeSettings(raw: unknown): Settings {
  const input = isRecord(raw) ? raw : {};
  const d = DEFAULT_SETTINGS;
  const bool = (value: unknown, fallback: boolean) =>
    typeof value === 'boolean' ? value : fallback;

  return {
    waterIntervalMin:
      typeof input.waterIntervalMin === 'number'
        ? clampInterval(input.waterIntervalMin)
        : d.waterIntervalMin,
    breaksEnabled: bool(input.breaksEnabled, d.breaksEnabled),
    breakMode: input.breakMode === 'eye' || input.breakMode === 'pomodoro' ? input.breakMode : d.breakMode,
    message: sanitizeMessage(input.message),
    notificationStyle:
      input.notificationStyle === 'banner' || input.notificationStyle === 'persistent'
        ? input.notificationStyle
        : d.notificationStyle,
    chime: bool(input.chime, d.chime),
    goalMl: typeof input.goalMl === 'number' ? clampGoalMl(input.goalMl) : d.goalMl,
    unit: input.unit === 'ml' || input.unit === 'oz' ? input.unit : d.unit,
    quietHoursEnabled: bool(input.quietHoursEnabled, d.quietHoursEnabled),
    quietFrom: isValidTimeOfDay(input.quietFrom) ? input.quietFrom : d.quietFrom,
    quietTo: isValidTimeOfDay(input.quietTo) ? input.quietTo : d.quietTo,
    autoPauseWhenAway: bool(input.autoPauseWhenAway, d.autoPauseWhenAway),
  };
}

/** Keeps well-formed log entries and silently drops the rest. */
export function sanitizeEntries(raw: unknown): IntakeEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is IntakeEntry =>
      isRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.at === 'number' &&
      Number.isFinite(entry.at) &&
      isValidAmountMl(entry.ml) &&
      (entry.source === 'popup' || entry.source === 'reminder'),
  );
}

/** Fills gaps in the reminder state; the defaults mean "not paused". */
export function sanitizeRuntime(raw: unknown): RuntimeState {
  const input = isRecord(raw) ? raw : {};
  const d = DEFAULT_RUNTIME;
  return {
    pausedUntil:
      typeof input.pausedUntil === 'number' && Number.isFinite(input.pausedUntil)
        ? input.pausedUntil
        : d.pausedUntil,
    pomodoroRound:
      typeof input.pomodoroRound === 'number' && input.pomodoroRound >= 0
        ? Math.floor(input.pomodoroRound)
        : d.pomodoroRound,
    breakSnoozed: input.breakSnoozed === true,
    skippedWhileAway: input.skippedWhileAway === true,
  };
}
