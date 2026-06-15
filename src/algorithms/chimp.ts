interface Cell {
  x: number;
  y: number;
  value: number;
}

function generateGrid(level: number, gridSize: number): Cell[] {
  const positions = new Set<string>();
  const cells: Cell[] = [];

  while (positions.size < level) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const key = `${x}-${y}`;
    if (positions.has(key)) continue;
    positions.add(key);
    cells.push({ x, y, value: cells.length + 1 });
  }

  return cells;
}

function calculateChimpFinalLevel(currentLevel: number): number {
  return Math.max(0, currentLevel - 1);
}

function isCorrectChimpCell(cellValue: number, nextExpected: number): boolean {
  return cellValue === nextExpected;
}

export { Cell, generateGrid, calculateChimpFinalLevel, isCorrectChimpCell };
