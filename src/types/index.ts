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

export interface ScoreRecord {
  testId: TestId;
  bestScore: number;
  lastScore?: number;
  attempts: number;
  updatedAt: number;
  history: ScoreHistoryPoint[];
  totalDuration: number;
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
