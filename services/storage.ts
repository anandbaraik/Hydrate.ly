import { browser } from 'wxt/browser';
import type { IntakeEntry, LogSource, RuntimeState, Settings } from '@/types';
import { pruneEntries } from '@/utils/history';
import { sanitizeEntries, sanitizeRuntime, sanitizeSettings } from '@/utils/validation';

// Settings live only in storage.sync; logs and device state only in
// storage.local. See docs/DECISIONS.md, ADR-006.
const SETTINGS_KEY = 'settings';
const ENTRIES_KEY = 'entries';
const RUNTIME_KEY = 'runtime';

/** Call to stop listening. */
type Unwatch = () => void;

/**
 * Runs a read-modify-write on one key without letting another interleave,
 * which would lose one of the two writes. Web Locks are shared by the popup,
 * the options page and the service worker, so this holds across all of them.
 */
function exclusive<T>(key: string, task: () => Promise<T>): Promise<T> {
  const locks = globalThis.navigator?.locks;
  if (locks) return locks.request(`hydrately:${key}`, task);

  // No Web Locks (older Node in tests): queue within this context instead.
  const result = (queues.get(key) ?? Promise.resolve()).then(task);
  queues.set(
    key,
    result.catch(() => undefined),
  );
  return result;
}
/** The tail of each key's queue, for the fallback above. */
const queues = new Map<string, Promise<unknown>>();

/**
 * Calls back when one key changes in one storage area. `storage.onChanged`
 * fires for every key in every area and in every extension context, so this
 * is also how the popup hears about writes made by the service worker.
 * A missing value (first write, or a cleared key) is parsed into defaults.
 */
function watch<T>(
  area: 'sync' | 'local',
  key: string,
  parse: (raw: unknown) => T,
  callback: (next: T, previous: T) => void,
): Unwatch {
  const listener = (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>, areaName: string) => {
    const change = changes[key];
    if (areaName !== area || !change) return;
    callback(parse(change.newValue), parse(change.oldValue));
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}

// Settings (storage.sync)

/** The saved settings, or the defaults on a fresh install. */
export async function getSettings(): Promise<Settings> {
  const data = await browser.storage.sync.get(SETTINGS_KEY);
  return sanitizeSettings(data[SETTINGS_KEY]);
}

/**
 * Merges `patch` into the saved settings and returns what was stored.
 * All settings sit under one key, so one change is one sync write.
 */
export function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  return exclusive(SETTINGS_KEY, async () => {
    const next = sanitizeSettings({ ...(await getSettings()), ...patch });
    await browser.storage.sync.set({ [SETTINGS_KEY]: next });
    return next;
  });
}

export function watchSettings(callback: (next: Settings, previous: Settings) => void): Unwatch {
  return watch('sync', SETTINGS_KEY, sanitizeSettings, callback);
}

// Intake log (storage.local)

/** Every logged drink still within the retention window, in the order logged. */
export async function getEntries(): Promise<IntakeEntry[]> {
  const data = await browser.storage.local.get(ENTRIES_KEY);
  return sanitizeEntries(data[ENTRIES_KEY]);
}

/** Appends one drink and prunes old entries. `at` is only passed in tests. */
export function addEntry(
  ml: number,
  source: LogSource,
  at: number = Date.now(),
): Promise<IntakeEntry> {
  return exclusive(ENTRIES_KEY, async () => {
    const entry: IntakeEntry = { id: crypto.randomUUID(), at, ml: Math.round(ml), source };
    const entries = pruneEntries([...(await getEntries()), entry], at);
    await browser.storage.local.set({ [ENTRIES_KEY]: entries });
    return entry;
  });
}

export function removeEntry(id: string): Promise<void> {
  return exclusive(ENTRIES_KEY, async () => {
    const entries = (await getEntries()).filter((entry) => entry.id !== id);
    await browser.storage.local.set({ [ENTRIES_KEY]: entries });
  });
}

export function watchEntries(callback: (next: IntakeEntry[]) => void): Unwatch {
  return watch('local', ENTRIES_KEY, sanitizeEntries, callback);
}

// Runtime state (storage.local)

/** Pause and Pomodoro state. Device-specific, so it is not synced (ADR-016). */
export async function getRuntime(): Promise<RuntimeState> {
  const data = await browser.storage.local.get(RUNTIME_KEY);
  return sanitizeRuntime(data[RUNTIME_KEY]);
}

/** Merges `patch` into the runtime state and returns what was stored. */
export function setRuntime(patch: Partial<RuntimeState>): Promise<RuntimeState> {
  return exclusive(RUNTIME_KEY, async () => {
    const next = sanitizeRuntime({ ...(await getRuntime()), ...patch });
    await browser.storage.local.set({ [RUNTIME_KEY]: next });
    return next;
  });
}

export function watchRuntime(callback: (next: RuntimeState) => void): Unwatch {
  return watch('local', RUNTIME_KEY, sanitizeRuntime, callback);
}
