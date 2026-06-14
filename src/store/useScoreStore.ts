import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestId, ScoreRecord } from '@/types';

interface ScoreStore {
  records: Partial<Record<TestId, ScoreRecord>>;
  updateScore: (testId: TestId, score: number) => void;
  getBestScore: (testId: TestId) => number | null;
  getLastScore: (testId: TestId) => number | null;
  getAttempts: (testId: TestId) => number;
  resetAll: () => void;
}

export const useScoreStore = create<ScoreStore>()(
  persist(
    (set, get) => ({
      records: {},
      updateScore: (testId: TestId, score: number) => {
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

        set((state) => ({
          records: {
            ...state.records,
            [testId]: {
              testId,
              bestScore,
              lastScore: score,
              attempts,
              updatedAt: Date.now(),
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
      resetAll: () => set({ records: {} }),
    }),
    {
      name: 'human-benchmark-scores',
    },
  ),
);
