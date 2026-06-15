import { describe, it, expect } from 'vitest';
import { getNextMode, calculateAverageReactionTime } from './reaction';
import type { ReactionMode } from './reaction';

describe('getNextMode', () => {
  it('returns one of the singleModes when isRandom is true', () => {
    const singleModes: ReactionMode[] = ['visual', 'auditory', 'tactile'];
    for (let i = 0; i < 50; i++) {
      const result = getNextMode('visual', i, true);
      expect(singleModes).toContain(result);
    }
  });

  it('cycles through modes sequentially when isRandom is false', () => {
    expect(getNextMode('visual', 0, false)).toBe('visual');
    expect(getNextMode('visual', 1, false)).toBe('auditory');
    expect(getNextMode('visual', 2, false)).toBe('tactile');
  });

  it('wraps around when attemptIndex exceeds mode count', () => {
    expect(getNextMode('visual', 3, false)).toBe('visual');
    expect(getNextMode('visual', 4, false)).toBe('auditory');
    expect(getNextMode('visual', 5, false)).toBe('tactile');
    expect(getNextMode('visual', 6, false)).toBe('visual');
  });
});

describe('calculateAverageReactionTime', () => {
  it('returns 0 for empty array', () => {
    expect(calculateAverageReactionTime([])).toBe(0);
  });

  it('returns the single attempt time for one entry', () => {
    expect(calculateAverageReactionTime([{ time: 250, mode: 'visual' }])).toBe(250);
  });

  it('returns rounded average for multiple attempts', () => {
    const attempts = [
      { time: 200, mode: 'visual' as ReactionMode },
      { time: 300, mode: 'auditory' as ReactionMode },
      { time: 400, mode: 'tactile' as ReactionMode },
    ];
    expect(calculateAverageReactionTime(attempts)).toBe(300);
  });

  it('rounds correctly', () => {
    const attempts = [
      { time: 100, mode: 'visual' as ReactionMode },
      { time: 200, mode: 'auditory' as ReactionMode },
    ];
    expect(calculateAverageReactionTime(attempts)).toBe(150);
  });

  it('rounds up when decimal is 0.5 or above', () => {
    const attempts = [
      { time: 101, mode: 'visual' as ReactionMode },
      { time: 202, mode: 'auditory' as ReactionMode },
    ];
    expect(calculateAverageReactionTime(attempts)).toBe(152);
  });

  it('rounds down when decimal is below 0.5', () => {
    const attempts = [
      { time: 100, mode: 'visual' as ReactionMode },
      { time: 200, mode: 'auditory' as ReactionMode },
      { time: 301, mode: 'tactile' as ReactionMode },
    ];
    expect(calculateAverageReactionTime(attempts)).toBe(200);
  });
});
