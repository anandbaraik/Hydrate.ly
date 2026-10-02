import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  addEntry,
  getEntries,
  getRuntime,
  getSettings,
  removeEntry,
  saveSettings,
  setRuntime,
  watchSettings,
} from '@/services/storage';
import { DEFAULT_SETTINGS } from '@/utils/constants';

beforeEach(() => fakeBrowser.reset());

describe('settings', () => {
  it('returns the defaults on a fresh install', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('saves to storage.sync and never to storage.local', async () => {
    await saveSettings({ waterIntervalMin: 60, unit: 'oz' });

    expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, waterIntervalMin: 60, unit: 'oz' });
    expect(Object.keys(await fakeBrowser.storage.sync.get())).toEqual(['settings']);
    expect(await fakeBrowser.storage.local.get()).toEqual({});
  });

  it('validates what it saves', async () => {
    const saved = await saveSettings({ waterIntervalMin: 1000, message: '   ' });
    expect(saved.waterIntervalMin).toBe(240);
    expect(saved.message).toBe(DEFAULT_SETTINGS.message);
  });

  it('keeps both changes when two saves start together', async () => {
    await Promise.all([saveSettings({ waterIntervalMin: 60 }), saveSettings({ unit: 'oz' })]);
    expect(await getSettings()).toMatchObject({ waterIntervalMin: 60, unit: 'oz' });
  });

  it('still keeps both changes where Web Locks are unavailable', async () => {
    vi.stubGlobal('navigator', {});
    try {
      await Promise.all([saveSettings({ waterIntervalMin: 90 }), saveSettings({ chime: false })]);
      expect(await getSettings()).toMatchObject({ waterIntervalMin: 90, chime: false });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('notifies watchers with the new and previous settings', async () => {
    const callback = vi.fn();
    const unwatch = watchSettings(callback);
    await saveSettings({ goalMl: 3000 });

    expect(callback).toHaveBeenCalledTimes(1);
    const [next, previous] = callback.mock.calls[0]!;
    expect(next.goalMl).toBe(3000);
    expect(previous.goalMl).toBe(DEFAULT_SETTINGS.goalMl);

    unwatch();
    await saveSettings({ goalMl: 2000 });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('intake log', () => {
  it('saves to storage.local and never to storage.sync', async () => {
    const entry = await addEntry(250, 'popup');

    expect(await getEntries()).toEqual([entry]);
    expect(Object.keys(await fakeBrowser.storage.local.get())).toEqual(['entries']);
    expect(await fakeBrowser.storage.sync.get()).toEqual({});
  });

  it('records the amount, source and time', async () => {
    const at = new Date(2026, 9, 2, 11, 40).getTime();
    const entry = await addEntry(330.4, 'reminder', at);
    expect(entry).toMatchObject({ ml: 330, source: 'reminder', at });
    expect(entry.id).toBeTruthy();
  });

  it('removes one entry by id', async () => {
    const first = await addEntry(250, 'popup');
    const second = await addEntry(500, 'popup');
    await removeEntry(first.id);
    expect(await getEntries()).toEqual([second]);
  });

  it('keeps every drink when several are logged together', async () => {
    // For example the popup and the "I drank" notification button at once.
    await Promise.all([addEntry(250, 'popup'), addEntry(500, 'reminder'), addEntry(100, 'popup')]);
    const amounts = (await getEntries()).map((entry) => entry.ml).sort((a, b) => a - b);
    expect(amounts).toEqual([100, 250, 500]);
  });

  it('keeps the log intact when a log and a removal overlap', async () => {
    const first = await addEntry(250, 'popup');
    await Promise.all([removeEntry(first.id), addEntry(500, 'popup')]);
    expect((await getEntries()).map((entry) => entry.ml)).toEqual([500]);
  });

  it('prunes entries older than the retention window', async () => {
    const now = new Date(2026, 9, 2, 12, 0).getTime();
    await addEntry(250, 'popup', new Date(2025, 0, 1).getTime());
    await addEntry(500, 'popup', now);
    expect((await getEntries()).map((entry) => entry.ml)).toEqual([500]);
  });
});

describe('runtime state', () => {
  it('merges patches and stays on the device', async () => {
    await setRuntime({ pausedUntil: 123 });
    await setRuntime({ pomodoroRound: 2 });

    expect(await getRuntime()).toMatchObject({ pausedUntil: 123, pomodoroRound: 2 });
    expect(await fakeBrowser.storage.sync.get()).toEqual({});
  });

  it('keeps both patches when two start together', async () => {
    await Promise.all([setRuntime({ pausedUntil: 456 }), setRuntime({ pomodoroRound: 3 })]);
    expect(await getRuntime()).toMatchObject({ pausedUntil: 456, pomodoroRound: 3 });
  });
});
