export function generateNumber(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export function calculateShowDuration(level: number, showDurationBase: number, showDurationPerDigit: number): number {
  return showDurationBase + level * showDurationPerDigit;
}

export function calculateFinalLevel(currentLevel: number): number {
  return Math.max(0, currentLevel - 1);
}
