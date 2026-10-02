import { describe, expect, it } from 'vitest';
import { progressFraction, progressStatus } from '@/utils/progress';

describe('progressFraction', () => {
  it('is the share of the goal reached', () => {
    expect(progressFraction(1250, 2500)).toBe(0.5);
    expect(progressFraction(0, 2500)).toBe(0);
  });

  it('stays full past the goal', () => {
    expect(progressFraction(3000, 2500)).toBe(1);
  });

  it('is zero without a goal', () => {
    expect(progressFraction(500, 0)).toBe(0);
  });
});

describe('progressStatus', () => {
  it('shows the percentage and what is left', () => {
    expect(progressStatus(1250, 2500, 'ml')).toBe('50% · 1,250 ml to go');
  });

  it('never reads 100% while there is still some to go', () => {
    expect(progressStatus(2495, 2500, 'ml')).toBe('99% · 5 ml to go');
  });

  it('congratulates at and past the goal', () => {
    expect(progressStatus(2500, 2500, 'ml')).toBe('Goal reached. Nice work.');
    expect(progressStatus(3200, 2500, 'ml')).toBe('Goal reached. Nice work.');
  });

  it('has an empty state for no drinks today', () => {
    expect(progressStatus(0, 2500, 'ml')).toBe('No drinks logged yet · 2,500 ml to go');
  });

  it('uses the unit the user picked', () => {
    expect(progressStatus(1250, 2500, 'oz')).toBe('50% · 42 oz to go');
  });
});
