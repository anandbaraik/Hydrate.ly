export type Unit = 'ml' | 'oz';
export type BreakMode = 'eye' | 'pomodoro';
export type NotificationStyle = 'banner' | 'persistent';
export type LogSource = 'popup' | 'reminder';
export type ReminderKind = 'water' | 'break';
export type PauseOption = '30min' | '1hour' | 'tomorrow';
export type IdleState = 'active' | 'idle' | 'locked';

/** User settings. Stored in chrome.storage.sync so they follow the user. */
export interface Settings {
  /** Minutes between water reminders, 15 to 240. */
  waterIntervalMin: number;
  breaksEnabled: boolean;
  breakMode: BreakMode;
  /** Custom text shown in the water reminder. */
  message: string;
  notificationStyle: NotificationStyle;
  chime: boolean;
  /** Daily goal, always in millilitres regardless of the display unit. */
  goalMl: number;
  unit: Unit;
  quietHoursEnabled: boolean;
  /** 24-hour "HH:MM". */
  quietFrom: string;
  /** 24-hour "HH:MM". */
  quietTo: string;
  autoPauseWhenAway: boolean;
}

/** One logged drink. Stored in chrome.storage.local. */
export interface IntakeEntry {
  id: string;
  /** Epoch milliseconds. */
  at: number;
  ml: number;
  source: LogSource;
}

/** Device-specific reminder state. Stored in chrome.storage.local. */
export interface RuntimeState {
  /** Epoch milliseconds until which reminders stay quiet, or null. */
  pausedUntil: number | null;
  /** Pomodoro rounds completed in the current cycle. */
  pomodoroRound: number;
  /** The next break alarm is a snooze, so it repeats the current round. */
  breakSnoozed: boolean;
  /** A reminder was skipped because the user was away. */
  skippedWhileAway: boolean;
}

export interface NotificationContent {
  title: string;
  message: string;
  /** Primary action first. Chrome shows at most two. */
  buttons: [string, string];
}
