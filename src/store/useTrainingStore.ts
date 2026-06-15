import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TrainingPlan,
  TrainingPlanItem,
  TrainingSession,
  TrainingSessionItem,
  DailyTraining,
  TrainingPlanTemplateType,
} from '@/types';
import { TRAINING_TEMPLATES, TESTS } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateDailyPlan(dateStr: string): TrainingPlan {
  const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val, 10), 0);
  const random = seededRandom(seed);

  const allTestIds = TESTS.map((t) => t.id);
  const shuffled = [...allTestIds].sort(() => random() - 0.5);
  const selectedCount = 4 + Math.floor(random() * 3);
  const selectedTests = shuffled.slice(0, selectedCount);

  const items: TrainingPlanItem[] = selectedTests.map((testId) => ({
    testId,
    rounds: 1 + Math.floor(random() * 3),
  }));

  const colorIndex = Math.floor(random() * TRAINING_TEMPLATES.length);

  return {
    id: `daily-${dateStr}`,
    name: `每日训练 · ${dateStr}`,
    description: '今日专属训练计划，坚持每日训练，持续提升能力！',
    items,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color: TRAINING_TEMPLATES[colorIndex].color,
    icon: 'calendar',
  };
}

interface TrainingStore {
  plans: TrainingPlan[];
  currentSession: TrainingSession | null;
  dailyTraining: DailyTraining | null;
  completedSessions: string[];

  createPlan: (name: string, description: string, items: TrainingPlanItem[], color?: string, icon?: string) => TrainingPlan;
  updatePlan: (id: string, updates: Partial<Omit<TrainingPlan, 'id' | 'createdAt'>>) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => TrainingPlan | null;
  getPlan: (id: string) => TrainingPlan | undefined;
  createFromTemplate: (templateId: TrainingPlanTemplateType) => TrainingPlan;

  getDailyTraining: () => DailyTraining;
  markDailyCompleted: () => void;

  startSession: (planId: string) => TrainingSession;
  startSessionFromPlan: (plan: TrainingPlan) => TrainingSession;
  getCurrentTest: () => { testId: string; round: number; totalRounds: number } | null;
  completeCurrentRound: (score: number) => void;
  nextItem: () => void;
  completeSession: () => void;
  cancelSession: () => void;
  getSessionProgress: () => number;

  resetAll: () => void;
}

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      plans: [],
      currentSession: null,
      dailyTraining: null,
      completedSessions: [],

      createPlan: (name, description, items, color = '#00d4ff', icon = 'target') => {
        const now = Date.now();
        const newPlan: TrainingPlan = {
          id: generateId(),
          name,
          description,
          items,
          createdAt: now,
          updatedAt: now,
          color,
          icon,
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
        return newPlan;
      },

      updatePlan: (id, updates) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p,
          ),
        }));
      },

      deletePlan: (id) => {
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
      },

      duplicatePlan: (id) => {
        const plan = get().plans.find((p) => p.id === id);
        if (!plan) return null;
        const newPlan = get().createPlan(
          `${plan.name} (副本)`,
          plan.description,
          plan.items,
          plan.color,
          plan.icon,
        );
        return newPlan;
      },

      getPlan: (id) => {
        return get().plans.find((p) => p.id === id);
      },

      createFromTemplate: (templateId) => {
        const template = TRAINING_TEMPLATES.find((t) => t.id === templateId);
        if (!template) {
          throw new Error(`Template not found: ${templateId}`);
        }
        return get().createPlan(template.name, template.description, template.items, template.color, template.icon);
      },

      getDailyTraining: () => {
        const today = getTodayDateString();
        const state = get();

        if (state.dailyTraining && state.dailyTraining.date === today) {
          return state.dailyTraining;
        }

        const plan = generateDailyPlan(today);
        const daily: DailyTraining = {
          date: today,
          plan,
          completed: false,
        };

        set({ dailyTraining: daily });
        return daily;
      },

      markDailyCompleted: () => {
        const today = getTodayDateString();
        set((state) => {
          if (!state.dailyTraining || state.dailyTraining.date !== today) return state;
          return {
            dailyTraining: {
              ...state.dailyTraining,
              completed: true,
              completedAt: Date.now(),
            },
          };
        });
      },

      startSession: (planId) => {
        const plan = get().getPlan(planId);
        if (!plan) {
          throw new Error(`Plan not found: ${planId}`);
        }
        return get().startSessionFromPlan(plan);
      },

      startSessionFromPlan: (plan) => {
        const sessionItems: TrainingSessionItem[] = plan.items.map((item) => ({
          testId: item.testId,
          rounds: item.rounds,
          currentRound: 0,
          completed: false,
          scores: [],
        }));

        const session: TrainingSession = {
          id: generateId(),
          planId: plan.id,
          planName: plan.name,
          items: sessionItems,
          currentItemIndex: 0,
          startTime: Date.now(),
          completed: false,
        };

        set({ currentSession: session });
        return session;
      },

      getCurrentTest: () => {
        const session = get().currentSession;
        if (!session || session.completed) return null;

        const item = session.items[session.currentItemIndex];
        if (!item || item.completed) return null;

        return {
          testId: item.testId,
          round: item.currentRound + 1,
          totalRounds: item.rounds,
        };
      },

      completeCurrentRound: (score) => {
        set((state) => {
          if (!state.currentSession) return state;

          const items = [...state.currentSession.items];
          const currentItem = { ...items[state.currentSession.currentItemIndex] };

          currentItem.scores = [...currentItem.scores, score];
          currentItem.currentRound += 1;

          if (currentItem.currentRound >= currentItem.rounds) {
            currentItem.completed = true;
          }

          items[state.currentSession.currentItemIndex] = currentItem;

          const allCompleted = items.every((item) => item.completed);

          return {
            currentSession: {
              ...state.currentSession,
              items,
              completed: allCompleted,
              endTime: allCompleted ? Date.now() : undefined,
            },
          };
        });
      },

      nextItem: () => {
        set((state) => {
          if (!state.currentSession) return state;

          let nextIndex = state.currentSession.currentItemIndex + 1;

          while (nextIndex < state.currentSession.items.length && state.currentSession.items[nextIndex].completed) {
            nextIndex += 1;
          }

          if (nextIndex >= state.currentSession.items.length) {
            const allCompleted = state.currentSession.items.every((item) => item.completed);
            return {
              currentSession: {
                ...state.currentSession,
                completed: allCompleted,
                endTime: allCompleted ? Date.now() : undefined,
              },
            };
          }

          return {
            currentSession: {
              ...state.currentSession,
              currentItemIndex: nextIndex,
            },
          };
        });
      },

      completeSession: () => {
        set((state) => {
          if (!state.currentSession) return state;
          const completedSessions = [...state.completedSessions, state.currentSession.id];
          return {
            currentSession: {
              ...state.currentSession,
              completed: true,
              endTime: Date.now(),
            },
            completedSessions: completedSessions.slice(-50),
          };
        });
      },

      cancelSession: () => {
        set({ currentSession: null });
      },

      getSessionProgress: () => {
        const session = get().currentSession;
        if (!session) return 0;

        const totalRounds = session.items.reduce((sum, item) => sum + item.rounds, 0);
        const completedRounds = session.items.reduce((sum, item) => sum + item.scores.length, 0);

        return totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;
      },

      resetAll: () => {
        set({ plans: [], currentSession: null, dailyTraining: null, completedSessions: [] });
      },
    }),
    {
      name: 'human-benchmark-training',
    },
  ),
);
