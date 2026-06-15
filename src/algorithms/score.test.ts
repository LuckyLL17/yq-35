import { describe, it, expect } from 'vitest';
import { getNormalizedScore, calculateBestScore, calculateAbilityScore, REFERENCE_SCORES } from './score';

describe('getNormalizedScore', () => {
  it('higherIsBetter=true with score at reference returns 100', () => {
    expect(getNormalizedScore('typing', 60, true)).toBe(100);
  });

  it('higherIsBetter=true with score above reference returns capped at 100', () => {
    expect(getNormalizedScore('typing', 120, true)).toBe(100);
  });

  it('higherIsBetter=true with score below reference', () => {
    expect(getNormalizedScore('typing', 30, true)).toBe(50);
  });

  it('higherIsBetter=false with score at reference returns 100', () => {
    expect(getNormalizedScore('reaction', 200, false)).toBe(100);
  });

  it('higherIsBetter=false with score below reference returns above 100 capped at 100', () => {
    expect(getNormalizedScore('reaction', 100, false)).toBe(100);
  });

  it('higherIsBetter=false with score above reference', () => {
    expect(getNormalizedScore('reaction', 400, false)).toBe(50);
  });

  it('higherIsBetter=false with score=0 uses Math.max(score, 1)', () => {
    const result = getNormalizedScore('reaction', 0, false);
    const expected = Math.min(100, Math.max(0, (200 / 1) * 100));
    expect(result).toBe(expected);
    expect(result).toBe(100);
  });
});

describe('calculateBestScore', () => {
  it('with currentBest=0 always isBest=true', () => {
    expect(calculateBestScore(0, 50, true)).toEqual({ bestScore: 50, isBest: true });
    expect(calculateBestScore(0, 300, false)).toEqual({ bestScore: 300, isBest: true });
  });

  it('higherIsBetter=true with better score', () => {
    expect(calculateBestScore(50, 80, true)).toEqual({ bestScore: 80, isBest: true, improvement: 30 });
  });

  it('higherIsBetter=true with worse score', () => {
    expect(calculateBestScore(80, 50, true)).toEqual({ bestScore: 80, isBest: false });
  });

  it('higherIsBetter=false with better (lower) score', () => {
    expect(calculateBestScore(300, 200, false)).toEqual({ bestScore: 200, isBest: true, improvement: 100 });
  });

  it('higherIsBetter=false with worse (higher) score', () => {
    expect(calculateBestScore(200, 300, false)).toEqual({ bestScore: 200, isBest: false });
  });

  it('improvement calculation for higherIsBetter=true', () => {
    const result = calculateBestScore(10, 15, true);
    expect(result.improvement).toBe(5);
  });

  it('improvement calculation for higherIsBetter=false', () => {
    const result = calculateBestScore(500, 400, false);
    expect(result.improvement).toBe(100);
  });
});

describe('calculateAbilityScore', () => {
  it('with all null returns 0', () => {
    expect(calculateAbilityScore([null, null, null])).toBe(0);
  });

  it('with mixed null and numbers', () => {
    expect(calculateAbilityScore([null, 80, null, 60])).toBe(70);
  });

  it('with all numbers returns average rounded', () => {
    expect(calculateAbilityScore([80, 90, 100])).toBe(90);
  });

  it('with single score', () => {
    expect(calculateAbilityScore([75])).toBe(75);
  });
});
