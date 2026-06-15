import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestId, ScoreRecord, ScoreHistoryPoint } from '@/types';
import { TESTS, ABILITIES } from '@/types';

interface ScoreStore {
  records: Partial<Record<TestId, ScoreRecord>>;
  updateScore: (testId: TestId, score: number, duration?: number) => void;
  getBestScore: (testId: TestId) => number | null;
  getLastScore: (testId: TestId) => number | null;
  getAttempts: (testId: TestId) => number;
  getHistory: (testId: TestId) => ScoreHistoryPoint[];
  getTotalDuration: () => number;
  getTotalAttempts: () => number;
  getCompletedTests: () => number;
  getAbilityScore: (abilityId: string) => number;
  getNormalizedScore: (testId: TestId, score: number) => number;
  resetAll: () => void;
}

const REFERENCE_SCORES: Record<TestId, number> = {
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

export const useScoreStore = create<ScoreStore>()(
  persist(
    (set, get) => ({
      records: {},
      updateScore: (testId: TestId, score: number, duration: number = 0) => {
        const existing = get().records[testId];
        const currentBest = existing?.bestScore ?? 0;
        const attempts = (existing?.attempts ?? 0) + 1;
        const isHigherBetter: Record<TestId, boolean> = {
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

        let bestScore = currentBest;
        if (!existing) {
          bestScore = score;
        } else if (isHigherBetter[testId]) {
          bestScore = Math.max(currentBest, score);
        } else {
          bestScore = Math.min(currentBest, score);
        }

        const newPoint: ScoreHistoryPoint = {
          score,
          timestamp: Date.now(),
          duration,
        };

        const history = [...(existing?.history ?? []), newPoint].slice(-50);
        const totalDuration = (existing?.totalDuration ?? 0) + duration;

        set((state) => ({
          records: {
            ...state.records,
            [testId]: {
              testId,
              bestScore,
              lastScore: score,
              attempts,
              updatedAt: Date.now(),
              history,
              totalDuration,
            },
          },
        }));
      },
      getBestScore: (testId: TestId) => {
        return get().records[testId]?.bestScore ?? null;
      },
      getLastScore: (testId: TestId) => {
        return get().records[testId]?.lastScore ?? null;
      },
      getAttempts: (testId: TestId) => {
        return get().records[testId]?.attempts ?? 0;
      },
      getHistory: (testId: TestId) => {
        return get().records[testId]?.history ?? [];
      },
      getTotalDuration: () => {
        return Object.values(get().records).reduce((sum, r) => sum + (r?.totalDuration ?? 0), 0);
      },
      getTotalAttempts: () => {
        return Object.values(get().records).reduce((sum, r) => sum + (r?.attempts ?? 0), 0);
      },
      getCompletedTests: () => {
        return Object.keys(get().records).length;
      },
      getNormalizedScore: (testId: TestId, score: number) => {
        const test = TESTS.find((t) => t.id === testId);
        if (!test) return 0;
        const ref = REFERENCE_SCORES[testId] || 1;
        if (test.higherIsBetter) {
          return Math.min(100, (score / ref) * 100);
        } else {
          return Math.min(100, Math.max(0, (ref / Math.max(score, 1)) * 100));
        }
      },
      getAbilityScore: (abilityId: string) => {
        const ability = ABILITIES.find((a) => a.id === abilityId);
        if (!ability) return 0;
        const scores = ability.tests
          .map((testId) => {
            const record = get().records[testId];
            if (!record) return null;
            return get().getNormalizedScore(testId, record.bestScore);
          })
          .filter((s): s is number => s !== null);
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      },
      resetAll: () => set({ records: {} }),
    }),
    {
      name: 'human-benchmark-scores',
    },
  ),
);
