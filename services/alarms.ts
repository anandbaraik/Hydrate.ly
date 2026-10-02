import { browser } from 'wxt/browser';
import type { BreakMode, ReminderKind, Settings } from '@/types';
import { EYE_BREAK_INTERVAL_MIN, POMODORO } from '@/utils/constants';

// All scheduling goes through chrome.alarms. The service worker sleeps, so
// setInterval and setTimeout would never fire. See ADR-004.

// Creating an alarm under a name that already exists replaces it, which is
// how every reschedule and snooze below works. The manual test snippet in
// docs/TEST_PLAN.md uses these names: keep the two in step.
const ALARM_NAME: Record<ReminderKind, string> = {
  water: 'hydrately:water',
  break: 'hydrately:break',
};

/** Maps an alarm back to its reminder; null for alarms that are not ours. */
function kindOf(alarmName: string): ReminderKind | null {
  if (alarmName === ALARM_NAME.water) return 'water';
  if (alarmName === ALARM_NAME.break) return 'break';
  return null;
}

/** Repeats every `intervalMin`; the first reminder fires after `delayMin`. */
export async function scheduleWater(intervalMin: number, delayMin: number = intervalMin): Promise<void> {
  await browser.alarms.create(ALARM_NAME.water, {
    delayInMinutes: delayMin,
    periodInMinutes: intervalMin,
  });
}

/**
 * Eye breaks repeat on a fixed period. Pomodoro breaks are one-shot: each one
 * schedules the next, because short and long breaks differ in length.
 */
export async function scheduleBreak(mode: BreakMode, delayMin?: number): Promise<void> {
  if (mode === 'eye') {
    await browser.alarms.create(ALARM_NAME.break, {
      delayInMinutes: delayMin ?? EYE_BREAK_INTERVAL_MIN,
      periodInMinutes: EYE_BREAK_INTERVAL_MIN,
    });
    return;
  }
  await browser.alarms.create(ALARM_NAME.break, {
    delayInMinutes: delayMin ?? POMODORO.focusMin,
  });
}

export async function clearBreak(): Promise<void> {
  await browser.alarms.clear(ALARM_NAME.break);
}

/** Epoch milliseconds of the next reminder, or null when none is scheduled. */
export async function nextFireTime(kind: ReminderKind): Promise<number | null> {
  const alarm = await browser.alarms.get(ALARM_NAME[kind]);
  return alarm?.scheduledTime ?? null;
}

/**
 * Creates any alarm that is missing or no longer matches the settings, and
 * leaves correct ones alone so their countdown is not reset. Alarms can be
 * cleared on browser restart, so this runs on install and on startup.
 */
export async function ensureAlarms(settings: Settings): Promise<void> {
  const water = await browser.alarms.get(ALARM_NAME.water);
  if (water?.periodInMinutes !== settings.waterIntervalMin) {
    await scheduleWater(settings.waterIntervalMin);
  }

  if (!settings.breaksEnabled) {
    await clearBreak();
    return;
  }
  const current = await browser.alarms.get(ALARM_NAME.break);
  const expectedPeriod = settings.breakMode === 'eye' ? EYE_BREAK_INTERVAL_MIN : undefined;
  if (!current || current.periodInMinutes !== expectedPeriod) {
    await scheduleBreak(settings.breakMode);
  }
}

/** Starts both reminders again from a full interval. */
export async function restartAlarms(settings: Settings): Promise<void> {
  await scheduleWater(settings.waterIntervalMin);
  if (settings.breaksEnabled) await scheduleBreak(settings.breakMode);
  else await clearBreak();
}

export function onAlarm(callback: (kind: ReminderKind) => void): void {
  browser.alarms.onAlarm.addListener((alarm) => {
    const kind = kindOf(alarm.name);
    if (kind) callback(kind);
  });
}
