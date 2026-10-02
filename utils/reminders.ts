import type { IdleState, NotificationContent, Settings } from '@/types';
import { POMODORO, REMINDER_DRINK_ML, SNOOZE_MIN } from './constants';
import { isPaused } from './pause';
import { isWithinQuietHours } from './quietHours';
import { formatAmount, formatNumber } from './units';

// The decisions and wording behind a reminder, kept free of browser APIs so
// they can be unit tested. services/reminders.ts does the actual work.

export type SuppressReason = 'paused' | 'quiet-hours' | 'away';

interface SuppressInput {
  now: Date;
  settings: Settings;
  pausedUntil: number | null;
  idleState: IdleState;
}

/** Why a due reminder should stay silent, or null when it should show. */
export function suppressReason(input: SuppressInput): SuppressReason | null {
  const { now, settings, pausedUntil, idleState } = input;
  // Checked in this order so the reason reported is the one the user chose
  // most directly: an explicit pause, then their schedule, then idle state.
  if (isPaused(pausedUntil, now.getTime())) return 'paused';
  if (
    settings.quietHoursEnabled &&
    isWithinQuietHours(now, settings.quietFrom, settings.quietTo)
  ) {
    return 'quiet-hours';
  }
  if (settings.autoPauseWhenAway && idleState !== 'active') return 'away';
  return null;
}

export interface PomodoroStep {
  /** Rounds completed, including the one that just finished. */
  round: number;
  isLongBreak: boolean;
  breakMin: number;
  /** Minutes until the next break reminder: this break plus the next focus block. */
  nextDelayMin: number;
}

/** The break that follows focus round number `round` (1-based). */
export function pomodoroStep(round: number): PomodoroStep {
  const isLongBreak = round % POMODORO.roundsPerLongBreak === 0;
  const breakMin = isLongBreak ? POMODORO.longBreakMin : POMODORO.shortBreakMin;
  return { round, isLongBreak, breakMin, nextDelayMin: breakMin + POMODORO.focusMin };
}

const endsSentence = (text: string) => /[.!?…]$/.test(text);

/** Title, message and buttons for a water reminder (docs/DESIGN.md, Notifications). */
export function waterNotification(settings: Settings, todayMl: number): NotificationContent {
  // The progress sentence follows the user's own text, so close that text
  // with a full stop if they did not: "Drink up. 1,250 of 2,500 ml so far."
  const message = endsSentence(settings.message) ? settings.message : `${settings.message}.`;
  const progress = `${formatNumber(todayMl, settings.unit)} of ${formatAmount(settings.goalMl, settings.unit)} so far.`;
  return {
    title: 'Time for a sip',
    message: `${message} ${progress}`,
    buttons: [
      `I drank ${formatAmount(REMINDER_DRINK_ML, settings.unit)}`,
      `Snooze ${SNOOZE_MIN.water} min`,
    ],
  };
}

/**
 * Title, message and buttons for a break reminder. `step` is the Pomodoro
 * break that is starting, or null in 20-20-20 mode.
 */
export function breakNotification(settings: Settings, step: PomodoroStep | null): NotificationContent {
  const buttons: [string, string] = ['Done', `Snooze ${SNOOZE_MIN.break} min`];
  if (settings.breakMode === 'eye' || step === null) {
    return {
      title: 'Eye break · 20 seconds',
      message: 'Look at something about 20 feet away for 20 seconds.',
      buttons,
    };
  }
  if (step.isLongBreak) {
    return {
      title: `Long break · ${step.breakMin} minutes`,
      message: `${POMODORO.roundsPerLongBreak} rounds done. Step away from the screen for a while.`,
      buttons,
    };
  }
  return {
    title: `Break time · ${step.breakMin} minutes`,
    message: 'Stand up, stretch and rest your eyes.',
    buttons,
  };
}
