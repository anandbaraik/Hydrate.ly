import type { Unit } from '@/types';
import { formatAmount } from './units';

/** Share of the goal reached, from 0 to 1. The ring stays full past the goal. */
export function progressFraction(currentMl: number, goalMl: number): number {
  return goalMl > 0 ? Math.min(1, Math.max(0, currentMl / goalMl)) : 0;
}

/** The status line under the ring: "50% · 1,250 ml to go". */
export function progressStatus(currentMl: number, goalMl: number, unit: Unit): string {
  const left = goalMl - currentMl;
  if (left <= 0) return 'Goal reached. Nice work.';
  const toGo = `${formatAmount(left, unit)} to go`;
  if (currentMl <= 0) return `No drinks logged yet · ${toGo}`;
  // Rounded down, so it never reads 100% while there is still some to go.
  return `${Math.floor(progressFraction(currentMl, goalMl) * 100)}% · ${toGo}`;
}
