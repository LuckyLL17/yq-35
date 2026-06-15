import { describe, it, expect } from 'vitest';
import { hslToRgb, getGridSize, adjustColorComponent, parseRgbString } from './colorVision';

describe('hslToRgb', () => {
  it('returns grayscale when saturation is 0 (r=g=b=l*255)', () => {
    const [r, g, b] = hslToRgb(0.5, 0, 0.6);
    expect(r).toBe(g);
    expect(g).toBe(b);
    expect(r).toBe(Math.round(0.6 * 255));
  });

  it('returns pure red [255, 0, 0] for h=0, s=1, l=0.5', () => {
    expect(hslToRgb(0, 1, 0.5)).toEqual([255, 0, 0]);
  });

  it('returns pure green [0, 255, 0] for h=1/3, s=1, l=0.5', () => {
    expect(hslToRgb(1 / 3, 1, 0.5)).toEqual([0, 255, 0]);
  });

  it('returns pure blue [0, 0, 255] for h=2/3, s=1, l=0.5', () => {
    expect(hslToRgb(2 / 3, 1, 0.5)).toEqual([0, 0, 255]);
  });

  it('returns white [255, 255, 255] for h=0, s=0, l=1', () => {
    expect(hslToRgb(0, 0, 1)).toEqual([255, 255, 255]);
  });

  it('returns black [0, 0, 0] for h=0, s=0, l=0', () => {
    expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
  });
});

describe('getGridSize', () => {
  it('returns size 2 for level 1', () => {
    expect(getGridSize(1, 1).size).toBe(2);
  });

  it('returns size 3 for level 3', () => {
    expect(getGridSize(3, 1).size).toBe(3);
  });

  it('returns size 3 for level 5', () => {
    expect(getGridSize(5, 1).size).toBe(3);
  });

  it('returns size 4 for level 8', () => {
    expect(getGridSize(8, 1).size).toBe(4);
  });

  it('returns size 4 for level 11', () => {
    expect(getGridSize(11, 1).size).toBe(4);
  });

  it('returns size 5 for level 15', () => {
    expect(getGridSize(15, 1).size).toBe(5);
  });

  it('returns size 5 for level 19', () => {
    expect(getGridSize(19, 1).size).toBe(5);
  });

  it('returns size 6 for level 25', () => {
    expect(getGridSize(25, 1).size).toBe(6);
  });

  it('clamps diff to at least 1 when diffMultiplier is 0.6', () => {
    const result = getGridSize(1, 0.6);
    expect(result.diff).toBeGreaterThanOrEqual(1);
  });
});

describe('adjustColorComponent', () => {
  it('returns a value between 0 and 255', () => {
    for (let i = 0; i < 100; i++) {
      const result = adjustColorComponent(128, 200);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(255);
    }
  });

  it('stays in bounds with mid value and small diff', () => {
    for (let i = 0; i < 100; i++) {
      const result = adjustColorComponent(128, 10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(255);
    }
  });
});

describe('parseRgbString', () => {
  it('parses "rgb(100, 200, 50)" into [100, 200, 50]', () => {
    expect(parseRgbString('rgb(100, 200, 50)')).toEqual([100, 200, 50]);
  });

  it('returns null for invalid string', () => {
    expect(parseRgbString('not-a-color')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseRgbString('')).toBeNull();
  });
});
