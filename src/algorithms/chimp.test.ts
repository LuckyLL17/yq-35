import { describe, it, expect } from 'vitest';
import { generateGrid, calculateChimpFinalLevel, isCorrectChimpCell } from './chimp';

describe('generateGrid', () => {
  it('returns correct number of cells', () => {
    const cells = generateGrid(5, 5);
    expect(cells).toHaveLength(5);
  });

  it('each cell has incrementing values', () => {
    const cells = generateGrid(4, 5);
    for (let i = 0; i < cells.length; i++) {
      expect(cells[i].value).toBe(i + 1);
    }
  });

  it('no two cells share the same position', () => {
    const cells = generateGrid(6, 5);
    const positionKeys = cells.map((c) => `${c.x}-${c.y}`);
    const uniqueKeys = new Set(positionKeys);
    expect(uniqueKeys.size).toBe(cells.length);
  });

  it('all positions within grid bounds', () => {
    const gridSize = 5;
    const cells = generateGrid(7, gridSize);
    for (const cell of cells) {
      expect(cell.x).toBeGreaterThanOrEqual(0);
      expect(cell.x).toBeLessThan(gridSize);
      expect(cell.y).toBeGreaterThanOrEqual(0);
      expect(cell.y).toBeLessThan(gridSize);
    }
  });

  it('with level 1 returns a single cell', () => {
    const cells = generateGrid(1, 5);
    expect(cells).toHaveLength(1);
    expect(cells[0].value).toBe(1);
  });

  it('with level matching gridSize^2 fills entire grid', () => {
    const gridSize = 3;
    const cells = generateGrid(gridSize * gridSize, gridSize);
    expect(cells).toHaveLength(gridSize * gridSize);
    const positionKeys = new Set(cells.map((c) => `${c.x}-${c.y}`));
    expect(positionKeys.size).toBe(gridSize * gridSize);
  });
});

describe('calculateChimpFinalLevel', () => {
  it('with level > 0 returns level - 1', () => {
    expect(calculateChimpFinalLevel(5)).toBe(4);
    expect(calculateChimpFinalLevel(1)).toBe(0);
    expect(calculateChimpFinalLevel(10)).toBe(9);
  });

  it('with level 0 returns 0', () => {
    expect(calculateChimpFinalLevel(0)).toBe(0);
  });
});

describe('isCorrectChimpCell', () => {
  it('with matching values returns true', () => {
    expect(isCorrectChimpCell(1, 1)).toBe(true);
    expect(isCorrectChimpCell(5, 5)).toBe(true);
  });

  it('with non-matching values returns false', () => {
    expect(isCorrectChimpCell(1, 2)).toBe(false);
    expect(isCorrectChimpCell(3, 7)).toBe(false);
  });
});
