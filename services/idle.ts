import { browser } from 'wxt/browser';
import type { IdleState } from '@/types';
import { IDLE_THRESHOLD_SEC } from '@/utils/constants';

/** 'idle' after five minutes without input; 'locked' when the screen is locked. */
export async function queryIdleState(): Promise<IdleState> {
  return browser.idle.queryState(IDLE_THRESHOLD_SEC);
}

export function watchIdleState(callback: (state: IdleState) => void): void {
  browser.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
  browser.idle.onStateChanged.addListener(callback);
}
