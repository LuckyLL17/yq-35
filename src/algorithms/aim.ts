interface Target {
  id: number;
  x: number;
  y: number;
}

function generateTargets(count: number, width: number, height: number, targetSize: number, padding: number): Target[] {
  const result: Target[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: i,
      x: padding + Math.random() * (width - padding * 2 - targetSize),
      y: padding + Math.random() * (height - padding * 2 - targetSize),
    });
  }
  return result;
}

function calculateAverageTime(times: number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

function calculateAccuracy(hitCount: number, missCount: number): number {
  const total = hitCount + missCount;
  if (total === 0) return 0;
  return Math.round((hitCount / total) * 100);
}

export { Target, generateTargets, calculateAverageTime, calculateAccuracy };
