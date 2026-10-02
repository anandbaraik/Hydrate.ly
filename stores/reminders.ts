import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { nextFireTime } from '@/services/alarms';
import { initReminders, pauseReminders, resumeReminders } from '@/services/reminders';
import { getRuntime, watchRuntime } from '@/services/storage';
import type { PauseOption } from '@/types';
import { isPaused, pauseUntil } from '@/utils/pause';
import { isWithinQuietHours } from '@/utils/quietHours';
import { useSettingsStore } from './settings';

/** What the popup shows about upcoming reminders, and the pause control. */
export const useRemindersStore = defineStore('reminders', () => {
  const pausedUntil = ref<number | null>(null);
  const nextWaterAt = ref<number | null>(null);
  const nextBreakAt = ref<number | null>(null);
  /** Refreshed with the alarm times; the countdown labels are relative to it. */
  const now = ref(Date.now());
  let watching = false;

  const paused = computed(() => isPaused(pausedUntil.value, now.value));
  const inQuietHours = computed(() => {
    const { quietHoursEnabled, quietFrom, quietTo } = useSettingsStore().settings;
    return quietHoursEnabled && isWithinQuietHours(new Date(now.value), quietFrom, quietTo);
  });

  /** Re-reads the alarm times. Call after anything that reschedules them. */
  async function refresh(): Promise<void> {
    const [water, rest] = await Promise.all([nextFireTime('water'), nextFireTime('break')]);
    now.value = Date.now();
    nextWaterAt.value = water;
    nextBreakAt.value = rest;
  }

  async function load(): Promise<void> {
    pausedUntil.value = (await getRuntime()).pausedUntil;
    // Alarms can go missing (browser restart, extension re-enabled); opening
    // the popup puts them back.
    await initReminders();
    await refresh();
    if (watching) return;
    watching = true;
    watchRuntime((runtime) => {
      pausedUntil.value = runtime.pausedUntil;
    });
  }

  async function pause(option: PauseOption): Promise<void> {
    const until = pauseUntil(option, new Date(), useSettingsStore().settings);
    pausedUntil.value = until;
    now.value = Date.now();
    await pauseReminders(until);
  }

  async function resume(): Promise<void> {
    pausedUntil.value = null;
    await resumeReminders();
    await refresh();
  }

  return {
    pausedUntil,
    nextWaterAt,
    nextBreakAt,
    now,
    paused,
    inQuietHours,
    refresh,
    load,
    pause,
    resume,
  };
});
