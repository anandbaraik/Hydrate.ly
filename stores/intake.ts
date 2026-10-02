import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { logDrink } from '@/services/reminders';
import { getEntries, removeEntry, watchEntries } from '@/services/storage';
import type { IntakeEntry } from '@/types';
import { dailyAverage, entriesForDay, streak, weekTotals } from '@/utils/history';
import { isValidAmountMl } from '@/utils/validation';
import { useSettingsStore } from './settings';

export const useIntakeStore = defineStore('intake', () => {
  const entries = ref<IntakeEntry[]>([]);
  const loaded = ref(false);
  /** The most recent log from this popup session; drives the Undo toast. */
  const lastLogged = ref<IntakeEntry | null>(null);
  /** "Today" is fixed when data loads; a popup is not open across midnight. */
  const now = ref(Date.now());
  let watching = false;

  const todayEntries = computed(() => entriesForDay(entries.value, now.value));
  const todayMl = computed(() => todayEntries.value.reduce((sum, entry) => sum + entry.ml, 0));
  const week = computed(() => weekTotals(entries.value, now.value));
  const averageMl = computed(() => dailyAverage(entries.value, now.value));
  const streakDays = computed(() =>
    streak(entries.value, useSettingsStore().settings.goalMl, now.value),
  );

  function apply(next: IntakeEntry[]): void {
    now.value = Date.now();
    entries.value = next;
    // Drop the toast if its entry is gone, e.g. removed from the history list.
    if (lastLogged.value && !next.some((entry) => entry.id === lastLogged.value?.id)) {
      lastLogged.value = null;
    }
  }

  async function load(): Promise<void> {
    apply(await getEntries());
    loaded.value = true;
    if (watching) return;
    watching = true;
    // Also catches drinks logged from a notification while the popup is open.
    watchEntries(apply);
  }

  /** Logs a drink. Returns false, without saving, when the amount is invalid. */
  async function log(ml: number): Promise<boolean> {
    if (!isValidAmountMl(ml)) return false;
    lastLogged.value = await logDrink(ml, 'popup');
    // Re-read rather than wait for the storage event, so the ring moves at once.
    apply(await getEntries());
    return true;
  }

  async function remove(id: string): Promise<void> {
    await removeEntry(id);
    apply(await getEntries());
  }

  /** Removes the drink the toast is showing; apply() then clears the toast. */
  async function undo(): Promise<void> {
    if (lastLogged.value) await remove(lastLogged.value.id);
  }

  return {
    entries,
    loaded,
    lastLogged,
    todayEntries,
    todayMl,
    week,
    averageMl,
    streakDays,
    load,
    log,
    remove,
    undo,
  };
});
