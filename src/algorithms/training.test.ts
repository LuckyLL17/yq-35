import { describe, it, expect } from 'vitest';
import { seededRandom, generateDailySeed, calculateSessionProgress, getTodayDateString } from './training';

describe('seededRandom', () => {
  it('with same seed produces same sequence', () => {
    const rng1 = seededRandom(42);
    const rng2 = seededRandom(42);
    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];
    expect(seq1).toEqual(seq2);
  });

  it('with different seeds produces different sequences', () => {
    const rng1 = seededRandom(1);
    const rng2 = seededRandom(999);
    const val1 = rng1();
    const val2 = rng2();
    expect(val1).not.toBe(val2);
  });

  it('values are between 0 and 1', () => {
    const rng = seededRandom(123);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('is deterministic', () => {
    const rng = seededRandom(7);
    const first = rng();
    const second = rng();
    const third = rng();
    const rng2 = seededRandom(7);
    expect(rng2()).toBe(first);
    expect(rng2()).toBe(second);
    expect(rng2()).toBe(third);
  });
});

describe('generateDailySeed', () => {
  it('with date string "2024-01-15"', () => {
    expect(generateDailySeed('2024-01-15')).toBe(2024 + 1 + 15);
  });

  it('with different dates gives different seeds', () => {
    const seed1 = generateDailySeed('2024-01-15');
    const seed2 = generateDailySeed('2024-02-20');
    expect(seed1).not.toBe(seed2);
  });
});

describe('calculateSessionProgress', () => {
  it('with empty items returns 0', () => {
    expect(calculateSessionProgress([])).toBe(0);
  });

  it('with partial completion', () => {
    const items = [{ rounds: 4, scores: [80, 90] }];
    expect(calculateSessionProgress(items)).toBe(50);
  });

  it('with full completion returns 100', () => {
    const items = [{ rounds: 3, scores: [80, 90, 100] }];
    expect(calculateSessionProgress(items)).toBe(100);
  });

  it('with no completed rounds returns 0', () => {
    const items = [{ rounds: 5, scores: [] }];
    expect(calculateSessionProgress(items)).toBe(0);
  });

  it('with multiple items', () => {
    const items = [
      { rounds: 2, scores: [80] },
      { rounds: 3, scores: [90, 85] },
    ];
    expect(calculateSessionProgress(items)).toBe(60);
  });
});

describe('getTodayDateString', () => {
  it('with specific date returns formatted string', () => {
    const date = new Date(2024, 5, 15);
    expect(getTodayDateString(date)).toBe('2024-06-15');
  });

  it('with Jan 1 returns correct format', () => {
    const date = new Date(2024, 0, 1);
    expect(getTodayDateString(date)).toBe('2024-01-01');
  });

  it('with Dec 31 returns correct format', () => {
    const date = new Date(2024, 11, 31);
    expect(getTodayDateString(date)).toBe('2024-12-31');
  });

  it('pads months and days with leading zeros', () => {
    const date = new Date(2023, 2, 5);
    expect(getTodayDateString(date)).toBe('2023-03-05');
  });
});
