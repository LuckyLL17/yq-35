import { describe, it, expect } from 'vitest';
import { calculateCorrectChars, calculateWPM, calculateAccuracy } from './typing';

describe('calculateCorrectChars', () => {
  it('returns correct count for matching strings', () => {
    expect(calculateCorrectChars('hello', 'hello')).toBe(5);
  });

  it('returns correct count for partial match', () => {
    expect(calculateCorrectChars('hella', 'hello')).toBe(4);
  });

  it('returns 0 for no match', () => {
    expect(calculateCorrectChars('abc', 'xyz')).toBe(0);
  });

  it('returns 0 for empty input', () => {
    expect(calculateCorrectChars('', 'hello')).toBe(0);
  });

  it('handles input longer than target', () => {
    expect(calculateCorrectChars('hellooo', 'hello')).toBe(5);
  });

  it('returns target length for exact match', () => {
    expect(calculateCorrectChars('world', 'world')).toBe(5);
  });
});

describe('calculateWPM', () => {
  it('returns 0 for 0 correct chars', () => {
    expect(calculateWPM(0)).toBe(0);
  });

  it('returns 5 for 25 correct chars', () => {
    expect(calculateWPM(25)).toBe(5);
  });

  it('returns 20 for 100 correct chars', () => {
    expect(calculateWPM(100)).toBe(20);
  });

  it('returns 1 for 7 correct chars (floored)', () => {
    expect(calculateWPM(7)).toBe(1);
  });
});

describe('calculateAccuracy', () => {
  it('returns 0 for 0 total input chars', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('returns 100 for perfect accuracy', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('returns 50 for 50% accuracy', () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
  });

  it('returns correct accuracy for partial match', () => {
    expect(calculateAccuracy(3, 5)).toBe(60);
  });
});
