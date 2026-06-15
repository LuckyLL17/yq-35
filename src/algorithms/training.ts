export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateDailySeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, val) => acc + parseInt(val, 10), 0);
}

export function calculateSessionProgress(items: { rounds: number; scores: number[] }[]): number {
  const totalRounds = items.reduce((sum, item) => sum + item.rounds, 0);
  const completedRounds = items.reduce((sum, item) => sum + item.scores.length, 0);
  return totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;
}

export function getTodayDateString(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
