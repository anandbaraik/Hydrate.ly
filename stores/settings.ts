import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSettings, saveSettings, watchSettings } from '@/services/storage';
import type { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/utils/constants';
import { sanitizeSettings } from '@/utils/validation';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS });
  const loaded = ref(false);
  /** The last change could not be saved; the app shows a notice. */
  const saveFailed = ref(false);
  let watching = false;

  async function load(): Promise<void> {
    settings.value = await getSettings();
    loaded.value = true;
    if (watching) return;
    watching = true;
    // Keeps the popup and the options page in step, and picks up sync changes.
    watchSettings((next) => {
      settings.value = next;
    });
  }

  /**
   * Never rejects: form controls call this without awaiting it. A failed
   * save puts the screen back to what is actually stored and sets `saveFailed`.
   */
  async function update(patch: Partial<Settings>): Promise<void> {
    const previous = settings.value;
    // Update the screen first, then persist the validated result.
    settings.value = sanitizeSettings({ ...previous, ...patch });
    try {
      settings.value = await saveSettings(patch);
      saveFailed.value = false;
    } catch (error) {
      console.error('Hydrate.ly: could not save settings.', error);
      settings.value = previous;
      saveFailed.value = true;
    }
  }

  return { settings, loaded, saveFailed, load, update };
});
