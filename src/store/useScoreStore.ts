import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestId, ScoreRecord, ScoreHistoryPoint, TestRecord, UnlockedAchievement, AchievementContext } from '@/types';
import { TESTS, ABILITIES } from '@/types';
import { ACHIEVEMENTS } from '@/data/achievements';
import { getNormalizedScore as algoGetNormalizedScore, calculateBestScore, calculateAbilityScore, IS_HIGHER_BETTER } from '@/algorithms/score';

interface ScoreStore {
  records: Partial<Record<TestId, ScoreRecord>>;
  allTestRecords: TestRecord[];
  unlockedAchievements: UnlockedAchievement[];
  newlyUnlockedAchievements: string[];

  updateScore: (testId: TestId, score: number, duration?: number, metadata?: Record<string, unknown>) => string[];
  getBestScore: (testId: TestId) => number | null;
  getLastScore: (testId: TestId) => number | null;
  getAttempts: (testId: TestId) => number;
  getHistory: (testId: TestId) => ScoreHistoryPoint[];
  getTotalDuration: () => number;
  getTotalAttempts: () => number;
  getCompletedTests: () => number;
  getAbilityScore: (abilityId: string) => number;
  getNormalizedScore: (testId: TestId, score: number) => number;

  getAllTestRecords: () => TestRecord[];
  getTestRecordsByFilter: (testIds?: TestId[], startDate?: number, endDate?: number) => TestRecord[];
  isAchievementUnlocked: (id: string) => boolean;
  getUnlockedCount: () => number;
  checkAchievementsOnProfileLoad: () => string[];
  clearNewlyUnlocked: () => void;

  resetAll: () => void;
}

export { REFERENCE_SCORES } from '@/algorithms/score';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useScoreStore = create<ScoreStore>()(
  persist(
    (set, get) => ({
      records: {},
      allTestRecords: [],
      unlockedAchievements: [],
      newlyUnlockedAchievements: [],

      updateScore: (testId: TestId, score: number, duration: number = 0, metadata?: Record<string, unknown>) => {
        const existing = get().records[testId];
        const currentBest = existing?.bestScore ?? 0;
        const attempts = (existing?.attempts ?? 0) + 1;

        const result = calculateBestScore(currentBest, score, IS_HIGHER_BETTER[testId]);
        if (!existing) {
          result.isBest = true;
          result.bestScore = score;
        }
        const bestScore = result.bestScore;
        const isBest = result.isBest;
        const improvement = result.improvement;

        const newPoint: ScoreHistoryPoint = {
          score,
          timestamp: Date.now(),
          duration,
        };

        const history = [...(existing?.history ?? []), newPoint].slice(-50);
        const totalDuration = (existing?.totalDuration ?? 0) + duration;

        const testRecord: TestRecord = {
          id: generateId(),
          testId,
          score,
          timestamp: newPoint.timestamp,
          duration,
          isBest,
          isNewRecord: isBest,
          improvement,
          metadata,
        };

        const newAllRecords = [...get().allTestRecords, testRecord].slice(-500);

        const newRecords: Partial<Record<TestId, ScoreRecord>> = {
          ...get().records,
          [testId]: {
            testId,
            bestScore,
            lastScore: score,
            attempts,
            updatedAt: Date.now(),
            history,
            totalDuration,
          },
        };

        const newCompletedTests = Object.keys(newRecords).length;
        const newTotalAttempts = Object.values(newRecords).reduce((s, r) => s + (r?.attempts ?? 0), 0);
        const newTotalDuration = Object.values(newRecords).reduce((s, r) => s + (r?.totalDuration ?? 0), 0);

        const ctx: AchievementContext = {
          records: newRecords,
          allTestRecords: newAllRecords,
          completedTests: newCompletedTests,
          totalAttempts: newTotalAttempts,
          totalDuration: newTotalDuration,
          currentTest: testId,
          currentScore: score,
          currentDuration: duration,
          isCurrentBest: isBest,
        };

        const unlockedIds = get().unlockedAchievements.map((a) => a.id);
        const newlyUnlocked: UnlockedAchievement[] = [];
        const newlyUnlockedIds: string[] = [];

        for (const ach of ACHIEVEMENTS) {
          if (unlockedIds.includes(ach.id)) continue;
          if (!ach.checkOn?.includes('test-complete')) continue;
          try {
            if (ach.condition(ctx)) {
              newlyUnlocked.push({ id: ach.id, unlockedAt: Date.now() });
              newlyUnlockedIds.push(ach.id);
            }
          } catch {
            // ignore
          }
        }

        set({
          records: newRecords,
          allTestRecords: newAllRecords,
          unlockedAchievements: [...get().unlockedAchievements, ...newlyUnlocked],
          newlyUnlockedAchievements: newlyUnlockedIds,
        });

        return newlyUnlockedIds;
      },

      getBestScore: (testId: TestId) => get().records[testId]?.bestScore ?? null,
      getLastScore: (testId: TestId) => get().records[testId]?.lastScore ?? null,
      getAttempts: (testId: TestId) => get().records[testId]?.attempts ?? 0,
      getHistory: (testId: TestId) => get().records[testId]?.history ?? [],
      getTotalDuration: () => Object.values(get().records).reduce((sum, r) => sum + (r?.totalDuration ?? 0), 0),
      getTotalAttempts: () => Object.values(get().records).reduce((sum, r) => sum + (r?.attempts ?? 0), 0),
      getCompletedTests: () => Object.keys(get().records).length,

      getNormalizedScore: (testId: TestId, score: number) => {
        const test = TESTS.find((t) => t.id === testId);
        if (!test) return 0;
        return algoGetNormalizedScore(testId, score, test.higherIsBetter);
      },

      getAbilityScore: (abilityId: string) => {
        const ability = ABILITIES.find((a) => a.id === abilityId);
        if (!ability) return 0;
        const scores = ability.tests
          .map((testId) => {
            const record = get().records[testId];
            if (!record) return null;
            return get().getNormalizedScore(testId, record.bestScore);
          });
        return calculateAbilityScore(scores);
      },

      getAllTestRecords: () => get().allTestRecords,

      getTestRecordsByFilter: (testIds?: TestId[], startDate?: number, endDate?: number) => {
        return get()
          .allTestRecords.filter((r) => {
            if (testIds && testIds.length > 0 && !testIds.includes(r.testId)) return false;
            if (startDate !== undefined && r.timestamp < startDate) return false;
            if (endDate !== undefined && r.timestamp > endDate) return false;
            return true;
          })
          .sort((a, b) => b.timestamp - a.timestamp);
      },

      isAchievementUnlocked: (id: string) => get().unlockedAchievements.some((a) => a.id === id),
      getUnlockedCount: () => get().unlockedAchievements.length,

      checkAchievementsOnProfileLoad: () => {
        const state = get();
        const ctx: AchievementContext = {
          records: state.records,
          allTestRecords: state.allTestRecords,
          completedTests: state.getCompletedTests(),
          totalAttempts: state.getTotalAttempts(),
          totalDuration: state.getTotalDuration(),
        };

        const unlockedIds = state.unlockedAchievements.map((a) => a.id);
        const newlyUnlocked: UnlockedAchievement[] = [];
        const newlyUnlockedIds: string[] = [];

        for (const ach of ACHIEVEMENTS) {
          if (unlockedIds.includes(ach.id)) continue;
          if (!ach.checkOn?.includes('profile-load')) continue;
          try {
            if (ach.condition(ctx)) {
              newlyUnlocked.push({ id: ach.id, unlockedAt: Date.now() });
              newlyUnlockedIds.push(ach.id);
            }
          } catch {
            // ignore
          }
        }

        if (newlyUnlocked.length > 0) {
          set({
            unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
            newlyUnlockedAchievements: newlyUnlockedIds,
          });
        }

        return newlyUnlockedIds;
      },

      clearNewlyUnlocked: () => set({ newlyUnlockedAchievements: [] }),

      resetAll: () => set({ records: {}, allTestRecords: [], unlockedAchievements: [], newlyUnlockedAchievements: [] }),
    }),
    {
      name: 'human-benchmark-scores',
    },
  ),
);
