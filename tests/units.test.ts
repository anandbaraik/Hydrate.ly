import { describe, expect, it } from 'vitest';
import { formatAmount, formatNumber, mlToUnit, unitToMl } from '@/utils/units';

describe('unit conversion', () => {
  it('leaves millilitres unchanged', () => {
    expect(mlToUnit(250, 'ml')).toBe(250);
    expect(unitToMl(250, 'ml')).toBe(250);
  });

  it('converts between ml and oz at 29.5735 ml per oz', () => {
    expect(mlToUnit(29.5735, 'oz')).toBeCloseTo(1);
    expect(unitToMl(8, 'oz')).toBe(237);
    expect(unitToMl(85, 'oz')).toBe(2514);
  });

  it('rounds typed values to whole millilitres', () => {
    expect(unitToMl(250.4, 'ml')).toBe(250);
    expect(unitToMl(1.5, 'oz')).toBe(44);
  });
});

describe('formatting', () => {
  it('adds a thousands separator and the unit', () => {
    expect(formatNumber(1250, 'ml')).toBe('1,250');
    expect(formatAmount(2500, 'ml')).toBe('2,500 ml');
  });

  it('shows the unit the user picked', () => {
    expect(formatAmount(250, 'oz')).toBe('8 oz');
    expect(formatAmount(500, 'oz')).toBe('17 oz');
    expect(formatAmount(2500, 'oz')).toBe('85 oz');
  });
});
