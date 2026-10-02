import type { Unit } from '@/types';
import { ML_PER_OZ } from './constants';

/** Amounts are always stored in ml; this converts for display. */
export function mlToUnit(ml: number, unit: Unit): number {
  return unit === 'oz' ? ml / ML_PER_OZ : ml;
}

/** Converts a value typed in the user's unit back to whole millilitres. */
export function unitToMl(value: number, unit: Unit): number {
  return Math.round(unit === 'oz' ? value * ML_PER_OZ : value);
}

/** "1,250" in the user's unit, without the unit label. */
export function formatNumber(ml: number, unit: Unit): string {
  return Math.round(mlToUnit(ml, unit)).toLocaleString('en-US');
}

/** "1,250 ml" or "42 oz". */
export function formatAmount(ml: number, unit: Unit): string {
  return `${formatNumber(ml, unit)} ${unit}`;
}
