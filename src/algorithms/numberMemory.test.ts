import { describe, it, expect } from 'vitest';
import { generateNumber, calculateShowDuration, calculateFinalLevel } from './numberMemory';

describe('generateNumber', () => {
  it('returns a string of the specified length', () => {
    expect(generateNumber(5)).toHaveLength(5);
  });

  it('returns a string containing only digits 0-9', () => {
    const result = generateNumber(100);
    expect(result).toMatch(/^[0-9]+$/);
  });

  it('returns an empty string when length is 0', () => {
    expect(generateNumber(0)).toBe('');
  });

  it('returns a string of length 1', () => {
    expect(generateNumber(1)).toHaveLength(1);
  });

  it('returns a string of length 5', () => {
    expect(generateNumber(5)).toHaveLength(5);
  });

  it('returns a string of length 10', () => {
    expect(generateNumber(10)).toHaveLength(10);
  });

  it('returns a string of length 20', () => {
    expect(generateNumber(20)).toHaveLength(20);
  });

  it('produces different results on subsequent calls', () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(generateNumber(10));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('calculateShowDuration', () => {
  it('returns showDurationBase when level is 0', () => {
    expect(calculateShowDuration(0, 1000, 500)).toBe(1000);
  });

  it('returns showDurationBase + level * showDurationPerDigit for positive level', () => {
    expect(calculateShowDuration(3, 1000, 500)).toBe(2500);
  });

  it('returns correct result with base 0', () => {
    expect(calculateShowDuration(5, 0, 200)).toBe(1000);
  });

  it('returns correct result with perDigit 0', () => {
    expect(calculateShowDuration(10, 3000, 0)).toBe(3000);
  });

  it('formula correctness: base + level * perDigit', () => {
    const base = 2000;
    const perDigit = 300;
    const level = 7;
    expect(calculateShowDuration(level, base, perDigit)).toBe(base + level * perDigit);
  });

  it('handles large level values', () => {
    expect(calculateShowDuration(100, 0, 1000)).toBe(100000);
  });

  it('handles fractional perDigit', () => {
    expect(calculateShowDuration(3, 0, 333.5)).toBeCloseTo(1000.5);
  });
});

describe('calculateFinalLevel', () => {
  it('returns level - 1 when level is greater than 0', () => {
    expect(calculateFinalLevel(5)).toBe(4);
  });

  it('returns 0 when level is 0', () => {
    expect(calculateFinalLevel(0)).toBe(0);
  });

  it('returns 0 when level is 1', () => {
    expect(calculateFinalLevel(1)).toBe(0);
  });

  it('returns correct result for level 10', () => {
    expect(calculateFinalLevel(10)).toBe(9);
  });

  it('never returns a negative value', () => {
    expect(calculateFinalLevel(0)).toBeGreaterThanOrEqual(0);
  });
});
