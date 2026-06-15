import type { TestId } from '@/types';

export const REFERENCE_SCORES: Record<TestId, number> = {
  reaction: 200,
  'number-memory': 10,
  typing: 60,
  aim: 500,
  chimp: 10,
  'color-vision': 20,
  'sequence-memory': 15,
  stroop: 50,
  'math-speed': 30,
};

export const IS_HIGHER_BETTER: Record<TestId, boolean> = {
  reaction: false,
  'number-memory': true,
  typing: true,
  aim: false,
  chimp: true,
  'color-vision': true,
  'sequence-memory': true,
  stroop: true,
  'math-speed': true,
};

export function getNormalizedScore(testId: TestId, score: number, higherIsBetter: boolean): number {
  const ref = REFERENCE_SCORES[testId] || 1;
  if (higherIsBetter) {
    return Math.min(100, (score / ref) * 100);
  } else {
    return Math.min(100, Math.max(0, (ref / Math.max(score, 1)) * 100));
  }
}

export function calculateBestScore(currentBest: number, newScore: number, higherIsBetter: boolean): { bestScore: number; isBest: boolean; improvement?: number } {
  if (currentBest === 0) {
    return { bestScore: newScore, isBest: true };
  }
  if (higherIsBetter) {
    if (newScore > currentBest) {
      return { bestScore: newScore, isBest: true, improvement: newScore - currentBest };
    }
  } else {
    if (newScore < currentBest) {
      return { bestScore: newScore, isBest: true, improvement: currentBest - newScore };
    }
  }
  return { bestScore: currentBest, isBest: false };
}

export function calculateAbilityScore(normalizedScores: (number | null)[]): number {
  const validScores = normalizedScores.filter((s): s is number => s !== null);
  if (validScores.length === 0) return 0;
  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
}
