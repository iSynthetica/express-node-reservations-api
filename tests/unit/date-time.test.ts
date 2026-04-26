import { describe, expect, it } from 'vitest';
import {
  calcDuration,
  minutesToTime,
  timestampToDateString,
} from '../../src/shared/utils/date-time';

describe('date-time utilities', () => {
  it('formats minutes to HH:MM', () => {
    expect(minutesToTime(300)).toBe('05:00');
    expect(minutesToTime(65)).toBe('01:05');
  });

  it('calculates duration as end minus start', () => {
    expect(calcDuration(300, 480)).toBe(180);
  });

  it('formats unix timestamp milliseconds as YYYY-MM-DD', () => {
    expect(timestampToDateString(1592611200000)).toBe('2020-06-20');
  });
});
