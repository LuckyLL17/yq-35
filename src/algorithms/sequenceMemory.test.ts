import { describe, it, expect } from 'vitest';
import { addRoundToSequence, checkSequenceInput, calculateSequenceScore } from './sequenceMemory';

describe('addRoundToSequence', () => {
  it('returns new array with one additional element', () => {
    const sequence = [0, 1, 2];
    const result = addRoundToSequence(sequence, 4);
    expect(result.length).toBe(sequence.length + 1);
  });

  it('original sequence is not mutated', () => {
    const sequence = [0, 1, 2];
    const originalLength = sequence.length;
    addRoundToSequence(sequence, 4);
    expect(sequence.length).toBe(originalLength);
    expect(sequence).toEqual([0, 1, 2]);
  });

  it('new element is within range [0, colorCount)', () => {
    const colorCount = 4;
    for (let i = 0; i < 100; i++) {
      const result = addRoundToSequence([], colorCount);
      const newElement = result[result.length - 1];
      expect(newElement).toBeGreaterThanOrEqual(0);
      expect(newElement).toBeLessThan(colorCount);
    }
  });

  it('with empty sequence adds one element', () => {
    const result = addRoundToSequence([], 4);
    expect(result.length).toBe(1);
  });

  it('with existing sequence appends', () => {
    const sequence = [0, 2, 1];
    const result = addRoundToSequence(sequence, 4);
    expect(result.slice(0, 3)).toEqual([0, 2, 1]);
    expect(result.length).toBe(4);
  });
});

describe('checkSequenceInput', () => {
  it('with correct input returns true', () => {
    const sequence = [0, 2, 1, 3];
    expect(checkSequenceInput(sequence, 0, 0)).toBe(true);
    expect(checkSequenceInput(sequence, 1, 2)).toBe(true);
    expect(checkSequenceInput(sequence, 3, 3)).toBe(true);
  });

  it('with incorrect input returns false', () => {
    const sequence = [0, 2, 1, 3];
    expect(checkSequenceInput(sequence, 0, 1)).toBe(false);
    expect(checkSequenceInput(sequence, 2, 0)).toBe(false);
  });

  it('at different indices', () => {
    const sequence = [3, 1, 4, 1, 5];
    expect(checkSequenceInput(sequence, 0, 3)).toBe(true);
    expect(checkSequenceInput(sequence, 2, 4)).toBe(true);
    expect(checkSequenceInput(sequence, 4, 5)).toBe(true);
    expect(checkSequenceInput(sequence, 1, 1)).toBe(true);
  });

  it('with index out of bounds returns false (undefined comparison)', () => {
    const sequence = [0, 1];
    expect(checkSequenceInput(sequence, 5, 0)).toBe(false);
    expect(checkSequenceInput(sequence, 100, 1)).toBe(false);
  });
});

describe('calculateSequenceScore', () => {
  it('with length 1 returns 0', () => {
    expect(calculateSequenceScore(1)).toBe(0);
  });

  it('with length 5 returns 4', () => {
    expect(calculateSequenceScore(5)).toBe(4);
  });

  it('with length 10 returns 9', () => {
    expect(calculateSequenceScore(10)).toBe(9);
  });
});
