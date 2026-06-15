import { describe, it, expect } from 'vitest';
import { generateTargets, calculateAverageTime, calculateAccuracy } from './aim';

describe('generateTargets', () => {
  it('returns correct number of targets', () => {
    const targets = generateTargets(5, 800, 600, 30, 10);
    expect(targets).toHaveLength(5);
  });

  it('each target has unique id (0, 1, 2, ...)', () => {
    const targets = generateTargets(4, 800, 600, 30, 10);
    const ids = targets.map((t) => t.id);
    expect(ids).toEqual([0, 1, 2, 3]);
  });

  it('positions are within bounds', () => {
    const width = 800;
    const height = 600;
    const targetSize = 30;
    const padding = 10;
    const targets = generateTargets(50, width, height, targetSize, padding);
    for (const t of targets) {
      expect(t.x).toBeGreaterThanOrEqual(padding);
      expect(t.x).toBeLessThanOrEqual(width - padding - targetSize);
      expect(t.y).toBeGreaterThanOrEqual(padding);
      expect(t.y).toBeLessThanOrEqual(height - padding - targetSize);
    }
  });

  it('with count 0 returns empty array', () => {
    const targets = generateTargets(0, 800, 600, 30, 10);
    expect(targets).toEqual([]);
  });
});

describe('calculateAverageTime', () => {
  it('with empty array returns 0', () => {
    expect(calculateAverageTime([])).toBe(0);
  });

  it('with single value returns that value', () => {
    expect(calculateAverageTime([250])).toBe(250);
  });

  it('with multiple values returns rounded average', () => {
    expect(calculateAverageTime([100, 200, 300])).toBe(200);
    expect(calculateAverageTime([100, 200])).toBe(150);
    expect(calculateAverageTime([100, 201])).toBe(151);
  });
});

describe('calculateAccuracy', () => {
  it('with 0 total returns 0', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('with 100% accuracy', () => {
    expect(calculateAccuracy(10, 0)).toBe(100);
  });

  it('with partial accuracy', () => {
    expect(calculateAccuracy(7, 3)).toBe(70);
    expect(calculateAccuracy(1, 1)).toBe(50);
    expect(calculateAccuracy(1, 9)).toBe(10);
  });
});
