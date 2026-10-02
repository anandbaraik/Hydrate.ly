import { describe, expect, it } from 'vitest';
import { isWithinQuietHours } from '@/utils/quietHours';

const at = (hours: number, minutes = 0) => new Date(2026, 9, 2, hours, minutes);

describe('isWithinQuietHours', () => {
  it('handles a window that crosses midnight', () => {
    expect(isWithinQuietHours(at(21), '20:00', '08:00')).toBe(true);
    expect(isWithinQuietHours(at(2), '20:00', '08:00')).toBe(true);
    expect(isWithinQuietHours(at(12), '20:00', '08:00')).toBe(false);
  });

  it('handles a window within one day', () => {
    expect(isWithinQuietHours(at(13), '12:00', '14:00')).toBe(true);
    expect(isWithinQuietHours(at(15), '12:00', '14:00')).toBe(false);
  });

  it('includes the start and excludes the end', () => {
    expect(isWithinQuietHours(at(20, 0), '20:00', '08:00')).toBe(true);
    expect(isWithinQuietHours(at(19, 59), '20:00', '08:00')).toBe(false);
    expect(isWithinQuietHours(at(7, 59), '20:00', '08:00')).toBe(true);
    expect(isWithinQuietHours(at(8, 0), '20:00', '08:00')).toBe(false);
  });

  it('treats an empty or malformed window as never quiet', () => {
    expect(isWithinQuietHours(at(9), '09:00', '09:00')).toBe(false);
    expect(isWithinQuietHours(at(9), 'bad', '10:00')).toBe(false);
  });
});
