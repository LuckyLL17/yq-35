import { describe, it, expect } from 'vitest';
import {
  generateStroopQuestion,
  checkStroopAnswer,
  getStroopGridCols,
  calculateStroopAccuracy,
} from './stroop';

describe('generateStroopQuestion', () => {
  it('textColor is within [0, colorCount)', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateStroopQuestion(6);
      expect(q.textColor).toBeGreaterThanOrEqual(0);
      expect(q.textColor).toBeLessThan(6);
    }
  });

  it('displayColor is within [0, colorCount)', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateStroopQuestion(6);
      expect(q.displayColor).toBeGreaterThanOrEqual(0);
      expect(q.displayColor).toBeLessThan(6);
    }
  });

  it('textColor !== displayColor (always different)', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateStroopQuestion(6);
      expect(q.textColor).not.toBe(q.displayColor);
    }
  });

  it('with colorCount=2', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateStroopQuestion(2);
      expect(q.textColor).toBeGreaterThanOrEqual(0);
      expect(q.textColor).toBeLessThan(2);
      expect(q.displayColor).toBeGreaterThanOrEqual(0);
      expect(q.displayColor).toBeLessThan(2);
      expect(q.textColor).not.toBe(q.displayColor);
    }
  });

  it('with colorCount=6', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateStroopQuestion(6);
      expect(q.textColor).toBeGreaterThanOrEqual(0);
      expect(q.textColor).toBeLessThan(6);
      expect(q.displayColor).toBeGreaterThanOrEqual(0);
      expect(q.displayColor).toBeLessThan(6);
      expect(q.textColor).not.toBe(q.displayColor);
    }
  });
});

describe('checkStroopAnswer', () => {
  it('with correct answer returns true', () => {
    const q = { textColor: 1, displayColor: 3 };
    expect(checkStroopAnswer(q, 3)).toBe(true);
  });

  it('with wrong answer returns false', () => {
    const q = { textColor: 1, displayColor: 3 };
    expect(checkStroopAnswer(q, 2)).toBe(false);
  });

  it('with textColor returns false (displayColor !== textColor)', () => {
    const q = { textColor: 1, displayColor: 3 };
    expect(checkStroopAnswer(q, 1)).toBe(false);
  });
});

describe('getStroopGridCols', () => {
  it('with 2 or 3 returns grid-cols-3', () => {
    expect(getStroopGridCols(2)).toBe('grid-cols-3');
    expect(getStroopGridCols(3)).toBe('grid-cols-3');
  });

  it('with 4 returns grid-cols-4', () => {
    expect(getStroopGridCols(4)).toBe('grid-cols-4');
  });

  it('with 5 or 6 returns grid-cols-3', () => {
    expect(getStroopGridCols(5)).toBe('grid-cols-3');
    expect(getStroopGridCols(6)).toBe('grid-cols-3');
  });
});

describe('calculateStroopAccuracy', () => {
  it('with 0 total returns 0', () => {
    expect(calculateStroopAccuracy(0, 0)).toBe(0);
  });

  it('with 100% accuracy', () => {
    expect(calculateStroopAccuracy(10, 0)).toBe(100);
  });

  it('with partial accuracy (3 correct, 1 wrong = 75%)', () => {
    expect(calculateStroopAccuracy(3, 1)).toBe(75);
  });

  it('rounds correctly', () => {
    expect(calculateStroopAccuracy(1, 2)).toBe(33);
    expect(calculateStroopAccuracy(2, 3)).toBe(40);
  });
});
