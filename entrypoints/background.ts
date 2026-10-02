import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { onAlarm } from '@/services/alarms';
import { watchIdleState } from '@/services/idle';
import { clearReminder, onReminderButton, onReminderClick } from '@/services/notifications';
import {
  handleAlarm,
  handleBrowserStartup,
  handleIdleChange,
  handleReminderButton,
  handleSettingsChange,
  initReminders,
} from '@/services/reminders';
import { watchSettings } from '@/services/storage';

const run = (task: Promise<unknown>) => {
  task.catch((error) => console.error('Hydrate.ly:', error));
};

export default defineBackground(() => {
  // Listeners must be registered synchronously, so the service worker is
  // woken for events that arrive while it is asleep.
  browser.runtime.onInstalled.addListener(() => run(initReminders()));
  browser.runtime.onStartup.addListener(() => run(handleBrowserStartup()));

  onAlarm((kind) => run(handleAlarm(kind)));
  onReminderButton((kind, buttonIndex) => run(handleReminderButton(kind, buttonIndex)));
  onReminderClick((kind) => run(clearReminder(kind)));
  watchSettings((next, previous) => run(handleSettingsChange(next, previous)));
  watchIdleState((state) => run(handleIdleChange(state)));
});
