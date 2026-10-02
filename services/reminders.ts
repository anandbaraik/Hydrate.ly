import type {
  IdleState,
  IntakeEntry,
  LogSource,
  ReminderKind,
  RuntimeState,
  Settings,
} from '@/types';
import { REMINDER_DRINK_ML, SNOOZE_MIN } from '@/utils/constants';
import { entriesForDay } from '@/utils/history';
import {
  breakNotification,
  pomodoroStep,
  suppressReason,
  waterNotification,
  type PomodoroStep,
  type SuppressReason,
} from '@/utils/reminders';
import { clearBreak, ensureAlarms, restartAlarms, scheduleBreak, scheduleWater } from './alarms';
import { playChime } from './chime';
import { queryIdleState } from './idle';
import { clearReminder, showReminder } from './notifications';
import { addEntry, getEntries, getRuntime, getSettings, setRuntime } from './storage';

// The reminder flow: alarm fires -> check pause, quiet hours and idle ->
// show the notification -> handle Snooze / "I drank". See docs/ARCHITECTURE.md.

/** Makes sure the alarms match the saved settings. Runs on install and startup. */
export async function initReminders(): Promise<void> {
  await ensureAlarms(await getSettings());
}

/** A new browser session starts a fresh Pomodoro cycle. */
export async function handleBrowserStartup(): Promise<void> {
  await setRuntime({ pomodoroRound: 0, breakSnoozed: false });
  await initReminders();
}

/**
 * Handles a due reminder. Returns why it stayed silent, or null when the
 * notification was shown.
 */
export async function handleAlarm(
  kind: ReminderKind,
  now: Date = new Date(),
): Promise<SuppressReason | 'disabled' | null> {
  const [settings, runtime] = await Promise.all([getSettings(), getRuntime()]);

  if (kind === 'break' && !settings.breaksEnabled) {
    await clearBreak();
    return 'disabled';
  }
  const isPomodoro = kind === 'break' && settings.breakMode === 'pomodoro';

  const idleState = settings.autoPauseWhenAway ? await queryIdleState() : 'active';
  const reason = suppressReason({ now, settings, pausedUntil: runtime.pausedUntil, idleState });
  if (reason) {
    const patch: Partial<RuntimeState> = {};
    if (reason === 'away') patch.skippedWhileAway = true;
    if (isPomodoro) {
      // No focus round was worked, so nothing is counted: the cycle starts
      // over with a fresh focus block.
      await scheduleBreak('pomodoro');
      Object.assign(patch, { pomodoroRound: 0, breakSnoozed: false });
    }
    if (Object.keys(patch).length > 0) await setRuntime(patch);
    return reason;
  }

  let step: PomodoroStep | null = null;
  if (isPomodoro) {
    // A snoozed break repeats the same round instead of counting a new one.
    const round = runtime.breakSnoozed
      ? Math.max(1, runtime.pomodoroRound)
      : runtime.pomodoroRound + 1;
    step = pomodoroStep(round);
    // Pomodoro alarms are one-shot: each break schedules the next.
    await scheduleBreak('pomodoro', step.nextDelayMin);
    await setRuntime({ pomodoroRound: step.round, breakSnoozed: false });
  }

  const content =
    kind === 'water'
      ? waterNotification(settings, await todayTotalMl(now))
      : breakNotification(settings, step);
  await showReminder(kind, content, settings.notificationStyle === 'persistent');
  if (settings.chime) await playChime();
  return null;
}

/** Button 0 is the primary action ("I drank" / "Done"); button 1 is Snooze. */
export async function handleReminderButton(kind: ReminderKind, buttonIndex: number): Promise<void> {
  // A persistent notification stays up until it is cleared, so do that first.
  await clearReminder(kind);
  const settings = await getSettings();
  const snoozed = buttonIndex === 1;

  if (kind === 'water') {
    // Snooze brings the reminder back soon, then the usual interval resumes.
    if (snoozed) await scheduleWater(settings.waterIntervalMin, SNOOZE_MIN.water);
    else await logDrink(REMINDER_DRINK_ML, 'reminder');
    return;
  }

  // "Done" on a break needs nothing more: the next break is already scheduled.
  if (snoozed && settings.breaksEnabled) {
    await scheduleBreak(settings.breakMode, SNOOZE_MIN.break);
    if (settings.breakMode === 'pomodoro') await setRuntime({ breakSnoozed: true });
  }
}

/** Reschedules only the alarms affected by a settings change. */
export async function handleSettingsChange(next: Settings, previous: Settings): Promise<void> {
  if (next.waterIntervalMin !== previous.waterIntervalMin) {
    await scheduleWater(next.waterIntervalMin);
  }

  const breakChanged =
    next.breaksEnabled !== previous.breaksEnabled || next.breakMode !== previous.breakMode;
  if (!breakChanged) return;

  // Switching breaks on or off, or changing style, starts a fresh cycle.
  await setRuntime({ pomodoroRound: 0, breakSnoozed: false });
  if (next.breaksEnabled) {
    await scheduleBreak(next.breakMode);
  } else {
    await clearBreak();
    await clearReminder('break');
  }
}

/**
 * Resumes reminders when the user returns. The countdowns restart only if a
 * reminder was actually skipped, so brief idle spells do not keep pushing
 * reminders back.
 */
export async function handleIdleChange(state: IdleState): Promise<void> {
  if (state !== 'active') return;
  const runtime = await getRuntime();
  if (!runtime.skippedWhileAway) return;

  await setRuntime({ skippedWhileAway: false });
  await restartAlarms(await getSettings());
}

/**
 * Logs a drink and starts the water countdown again from a full interval:
 * there is no point reminding someone who has just had a drink.
 */
export async function logDrink(ml: number, source: LogSource): Promise<IntakeEntry> {
  const entry = await addEntry(ml, source);
  const settings = await getSettings();
  await scheduleWater(settings.waterIntervalMin);
  return entry;
}

/**
 * Silences reminders until `until` (epoch milliseconds) and clears any that
 * are on screen. The alarms keep running; handleAlarm skips them (ADR-017).
 */
export async function pauseReminders(until: number): Promise<void> {
  await setRuntime({ pausedUntil: until });
  await Promise.all([clearReminder('water'), clearReminder('break')]);
}

/** Ends a pause early. The alarms were never stopped, so nothing to restart. */
export async function resumeReminders(): Promise<void> {
  await setRuntime({ pausedUntil: null });
}

/** Today's intake so far, for the progress line in the water reminder. */
async function todayTotalMl(now: Date): Promise<number> {
  return entriesForDay(await getEntries(), now).reduce((sum, entry) => sum + entry.ml, 0);
}
