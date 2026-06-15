export type ReactionMode = 'visual' | 'auditory' | 'tactile' | 'mixed' | 'random';

export interface ReactionModeInfo {
  id: ReactionMode;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const REACTION_MODES: ReactionModeInfo[] = [
  {
    id: 'visual',
    name: '视觉模式',
    description: '观察颜色变化，看到绿色后立即点击',
    icon: 'eye',
    color: '#00d4ff',
  },
  {
    id: 'auditory',
    name: '听觉模式',
    description: '听到提示音后立即点击',
    icon: 'volume-2',
    color: '#a855f7',
  },
  {
    id: 'tactile',
    name: '触觉模式',
    description: '感受到设备振动后立即点击',
    icon: 'smartphone',
    color: '#ec4899',
  },
  {
    id: 'mixed',
    name: '混合模式',
    description: '三种模式依次切换，全面测试反应能力',
    icon: 'shuffle',
    color: '#f97316',
  },
  {
    id: 'random',
    name: '随机模式',
    description: '每轮随机选择一种模式，挑战极限反应',
    icon: 'dice-5',
    color: '#10b981',
  },
];

export type TestId =
  | 'reaction'
  | 'number-memory'
  | 'typing'
  | 'aim'
  | 'chimp'
  | 'color-vision'
  | 'sequence-memory'
  | 'stroop'
  | 'math-speed';

export interface TestMeta {
  id: TestId;
  name: string;
  description: string;
  route: string;
  unit: string;
  color: string;
  gradient: string;
  higherIsBetter: boolean;
}

export interface ScoreHistoryPoint {
  score: number;
  timestamp: number;
  duration: number;
}

export interface TestRecord {
  id: string;
  testId: TestId;
  score: number;
  timestamp: number;
  duration: number;
  isBest: boolean;
  isNewRecord: boolean;
  improvement?: number;
  metadata?: Record<string, unknown>;
}

export interface ScoreRecord {
  testId: TestId;
  bestScore: number;
  lastScore?: number;
  attempts: number;
  updatedAt: number;
  history: ScoreHistoryPoint[];
  totalDuration: number;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  color: string;
  condition: (context: AchievementContext) => boolean;
  checkOn?: ('test-complete' | 'profile-load')[];
  relatedTest?: TestId | 'all';
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

export interface AchievementContext {
  records: Partial<Record<TestId, ScoreRecord>>;
  allTestRecords: TestRecord[];
  completedTests: number;
  totalAttempts: number;
  totalDuration: number;
  currentTest?: TestId;
  currentScore?: number;
  currentDuration?: number;
  isCurrentBest?: boolean;
}

export type AbilityDimension =
  | 'reaction'
  | 'memory'
  | 'coordination'
  | 'vision'
  | 'cognition'
  | 'math';

export interface AbilityInfo {
  id: AbilityDimension;
  name: string;
  tests: TestId[];
  color: string;
}

export const ABILITIES: AbilityInfo[] = [
  { id: 'reaction', name: '反应速度', tests: ['reaction', 'aim'], color: '#00d4ff' },
  { id: 'memory', name: '记忆能力', tests: ['number-memory', 'sequence-memory', 'chimp'], color: '#a855f7' },
  { id: 'coordination', name: '手眼协调', tests: ['aim', 'typing'], color: '#ec4899' },
  { id: 'vision', name: '视觉辨别', tests: ['color-vision'], color: '#f97316' },
  { id: 'cognition', name: '认知能力', tests: ['stroop', 'chimp'], color: '#f59e0b' },
  { id: 'math', name: '数学心算', tests: ['math-speed'], color: '#10b981' },
];

export interface TrainingPlanItem {
  testId: TestId;
  rounds: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  items: TrainingPlanItem[];
  createdAt: number;
  updatedAt: number;
  color: string;
  icon: string;
}

export interface TrainingSessionItem {
  testId: TestId;
  rounds: number;
  currentRound: number;
  completed: boolean;
  scores: number[];
}

export interface TrainingSession {
  id: string;
  planId: string;
  planName: string;
  items: TrainingSessionItem[];
  currentItemIndex: number;
  startTime: number;
  endTime?: number;
  completed: boolean;
}

export interface DailyTraining {
  date: string;
  plan: TrainingPlan;
  completed: boolean;
  completedAt?: number;
}

export type TrainingPlanTemplateType = 'balanced' | 'reaction' | 'memory' | 'cognition' | 'quick';

export interface TrainingPlanTemplate {
  id: TrainingPlanTemplateType;
  name: string;
  description: string;
  items: TrainingPlanItem[];
  color: string;
  icon: string;
}

export const TRAINING_TEMPLATES: TrainingPlanTemplate[] = [
  {
    id: 'balanced',
    name: '综合训练',
    description: '全面提升各项能力的均衡训练套餐',
    items: [
      { testId: 'reaction', rounds: 3 },
      { testId: 'number-memory', rounds: 2 },
      { testId: 'aim', rounds: 2 },
      { testId: 'stroop', rounds: 2 },
      { testId: 'math-speed', rounds: 2 },
    ],
    color: '#00d4ff',
    icon: 'target',
  },
  {
    id: 'reaction',
    name: '反应速度',
    description: '专注于提升反应速度和手眼协调',
    items: [
      { testId: 'reaction', rounds: 5 },
      { testId: 'aim', rounds: 3 },
      { testId: 'typing', rounds: 2 },
    ],
    color: '#10b981',
    icon: 'zap',
  },
  {
    id: 'memory',
    name: '记忆强化',
    description: '深度训练记忆能力的专项套餐',
    items: [
      { testId: 'number-memory', rounds: 3 },
      { testId: 'sequence-memory', rounds: 3 },
      { testId: 'chimp', rounds: 2 },
    ],
    color: '#a855f7',
    icon: 'brain',
  },
  {
    id: 'cognition',
    name: '认知挑战',
    description: '挑战认知能力极限的高难度套餐',
    items: [
      { testId: 'stroop', rounds: 3 },
      { testId: 'chimp', rounds: 2 },
      { testId: 'math-speed', rounds: 3 },
      { testId: 'color-vision', rounds: 2 },
    ],
    color: '#f59e0b',
    icon: 'sparkles',
  },
  {
    id: 'quick',
    name: '快速热身',
    description: '5分钟快速热身训练',
    items: [
      { testId: 'reaction', rounds: 2 },
      { testId: 'math-speed', rounds: 1 },
      { testId: 'aim', rounds: 1 },
    ],
    color: '#ec4899',
    icon: 'flame',
  },
];

export const TESTS: TestMeta[] = [
  {
    id: 'reaction',
    name: '反应时间',
    description: '测试你的视觉反应速度，看看你能多快对颜色变化做出反应',
    route: '/reaction',
    unit: 'ms',
    color: '#00d4ff',
    gradient: 'from-neon-cyan',
    higherIsBetter: false,
  },
  {
    id: 'number-memory',
    name: '数字记忆',
    description: '测试你的短时数字记忆能力，记住闪现的数字序列',
    route: '/number-memory',
    unit: '位',
    color: '#a855f7',
    gradient: 'from-neon-purple',
    higherIsBetter: true,
  },
  {
    id: 'typing',
    name: '打字速度',
    description: '测试你的打字速度和准确率，限时 60 秒打字挑战',
    route: '/typing',
    unit: 'WPM',
    color: '#ec4899',
    gradient: 'from-neon-pink',
    higherIsBetter: true,
  },
  {
    id: 'aim',
    name: '瞄准测试',
    description: '测试手眼协调和瞄准能力，快速点击随机目标',
    route: '/aim',
    unit: 'ms',
    color: '#10b981',
    gradient: 'from-neon-green',
    higherIsBetter: false,
  },
  {
    id: 'chimp',
    name: '黑猩猩测试',
    description: '经典工作记忆测试，看看你能不能比黑猩猩更强',
    route: '/chimp',
    unit: '关',
    color: '#f59e0b',
    gradient: 'from-neon-yellow',
    higherIsBetter: true,
  },
  {
    id: 'color-vision',
    name: '颜色视觉',
    description: '测试你的颜色辨别能力，找出与众不同的方块',
    route: '/color-vision',
    unit: '级',
    color: '#f97316',
    gradient: 'from-neon-orange',
    higherIsBetter: true,
  },
  {
    id: 'sequence-memory',
    name: '序列记忆',
    description: 'Simon Says 游戏，记住灯光闪烁的顺序',
    route: '/sequence-memory',
    gradient: 'from-neon-cyan',
    unit: '轮',
    color: '#ef4444',
    higherIsBetter: true,
  },
  {
    id: 'stroop',
    name: 'Stroop 效应',
    description: '经典认知干扰测试，说出文字颜色而非文字含义',
    route: '/stroop',
    unit: '分',
    color: '#a855f7',
    gradient: 'from-neon-purple',
    higherIsBetter: true,
  },
  {
    id: 'math-speed',
    name: '数学速度',
    description: '测试心算速度，在限定时间内尽可能多地计算',
    route: '/math-speed',
    unit: '题',
    color: '#10b981',
    gradient: 'from-neon-green',
    higherIsBetter: true,
  },
];
