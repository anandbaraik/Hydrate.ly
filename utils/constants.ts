import type { RuntimeState, Settings } from '@/types';

// Every tunable number and default in one place. Amounts are in millilitres
// and durations in minutes unless the name says otherwise.

/** One US fluid ounce. Used for display only; storage is always ml. */
export const ML_PER_OZ = 29.5735;

/** Shown under the fixed title "Time for a sip" until the user writes their own. */
export const DEFAULT_MESSAGE = 'Small sips, better focus.';
/** Keeps the notification to a couple of lines on every OS. */
export const MESSAGE_MAX_LENGTH = 80;

/** Water reminder interval: 15 minutes to 4 hours, per the PRD. */
export const WATER_INTERVAL = {
  min: 15,
  max: 240,
  /** Slider step. */
  step: 15,
  /** The one-tap chips in Settings. Anything else counts as "Custom". */
  presets: [30, 45, 60],
  /** Where the slider lands when Custom is first picked. */
  customDefault: 90,
} as const;

export const GOAL_ML = { min: 250, max: 10000, default: 2500 } as const;
/** One logged drink. The upper bound catches typos such as an extra zero. */
export const AMOUNT_ML = { min: 1, max: 5000 } as const;

/** The glass and bottle buttons under the ring. */
export const QUICK_ADD_ML = { small: 250, large: 500 } as const;
/** Common sizes offered in the custom amount sheet: cup, glass, can, bottle. */
export const CUSTOM_QUICK_ML = [100, 150, 330, 750] as const;
/** Amount logged by the "I drank" notification button. */
export const REMINDER_DRINK_ML = 250;

/** How long the Snooze button delays each kind of reminder. */
export const SNOOZE_MIN = { water: 10, break: 5 } as const;

/** The 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds. */
export const EYE_BREAK_INTERVAL_MIN = 20;
/** Classic Pomodoro timings. See ADR-019 for how rounds are counted. */
export const POMODORO = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  roundsPerLongBreak: 4,
} as const;

/** No input for this long counts as "away" for auto-pause. */
export const IDLE_THRESHOLD_SEC = 300;

export const HISTORY_DAYS = 7;
/** Older entries are pruned on write; a year keeps long streaks intact. */
export const LOG_RETENTION_DAYS = 366;

/** "Until tomorrow" resumes at this time when quiet hours are off. */
export const DEFAULT_WAKE_TIME = '08:00';

/** First-run settings. They mirror the design (ADR-021). */
export const DEFAULT_SETTINGS: Settings = {
  waterIntervalMin: 45,
  breaksEnabled: true,
  breakMode: 'eye',
  message: DEFAULT_MESSAGE,
  notificationStyle: 'banner',
  chime: true,
  goalMl: GOAL_ML.default,
  unit: 'ml',
  quietHoursEnabled: true,
  quietFrom: '20:00',
  quietTo: '08:00',
  autoPauseWhenAway: true,
};

/** Reminder state on a fresh install: not paused, no Pomodoro rounds yet. */
export const DEFAULT_RUNTIME: RuntimeState = {
  pausedUntil: null,
  pomodoroRound: 0,
  breakSnoozed: false,
  skippedWhileAway: false,
};

/** Message type the service worker sends to the offscreen document. */
export const PLAY_CHIME_MESSAGE = 'hydrately:play-chime';
