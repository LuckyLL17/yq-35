# 人类反应测试网站 - 技术架构文档

## 1. 技术栈

| 类别 | 技术 | 版本 | 用途 |
|-----|------|------|-----|
| 框架 | React | ^18.3.1 | UI 构建 |
| 语言 | TypeScript | ~5.8.3 | 类型安全 |
| 构建工具 | Vite | ^6.3.5 | 构建和开发服务器 |
| 样式 | Tailwind CSS | ^3.4.17 | 原子化 CSS |
| 路由 | React Router | ^7.3.0 | 页面路由 |
| 状态管理 | Zustand | ^5.0.3 | 全局状态（成绩记录） |
| 图标 | Lucide React | ^0.511.0 | 图标库 |
| 工具 | clsx, tailwind-merge | latest | className 合并 |

---

## 2. 项目结构

```
src/
├── types/
│   └── index.ts              # 类型定义
├── store/
│   └── useScoreStore.ts      # Zustand 全局状态（成绩存储）
├── components/
│   ├── TestCard.tsx          # 测试卡片组件
│   ├── TestLayout.tsx        # 测试页面通用布局
│   ├── ResultDisplay.tsx     # 测试结果展示组件
│   └── Header.tsx            # 页头导航
├── pages/
│   ├── Home.tsx              # 首页
│   ├── ReactionTime.tsx      # 反应时间测试
│   ├── NumberMemory.tsx      # 数字记忆测试
│   ├── TypingSpeed.tsx       # 打字速度测试
│   ├── AimTrainer.tsx        # 瞄准测试
│   ├── ChimpTest.tsx         # 黑猩猩测试
│   ├── ColorVision.tsx       # 颜色视觉测试
│   ├── SequenceMemory.tsx    # 序列记忆测试
│   ├── StroopTest.tsx        # Stroop 效应测试
│   └── MathSpeed.tsx         # 数学速度测试
├── hooks/
│   └── useTheme.ts           # 主题 Hook
├── lib/
│   └── utils.ts              # 工具函数
├── App.tsx                   # 应用入口路由
├── main.tsx                  # React 入口
└── index.css                 # 全局样式
```

---

## 3. 核心数据结构

### 3.1 测试类型定义

```typescript
type TestId = 
  | 'reaction' 
  | 'number-memory' 
  | 'typing' 
  | 'aim' 
  | 'chimp' 
  | 'color-vision' 
  | 'sequence-memory' 
  | 'stroop' 
  | 'math-speed';

interface TestMeta {
  id: TestId;
  name: string;
  description: string;
  icon: string;
  unit: string;
  color: string;
}
```

### 3.2 成绩存储结构

```typescript
interface ScoreRecord {
  testId: TestId;
  bestScore: number;
  lastScore?: number;
  attempts: number;
  updatedAt: number;
}

interface ScoreStore {
  records: Record<TestId, ScoreRecord>;
  updateScore: (testId: TestId, score: number) => void;
  getBestScore: (testId: TestId) => number | null;
}
```

---

## 4. 状态管理

使用 Zustand 管理全局成绩状态，并通过 middleware 持久化到 localStorage：

- Store 初始化时从 localStorage 读取
- 每次更新成绩时自动同步到 localStorage
- 各测试页面通过 store 获取和更新成绩

---

## 5. 路由设计

| 路径 | 页面 | 说明 |
|-----|------|-----|
| `/` | Home | 首页 - 测试卡片列表 |
| `/reaction` | ReactionTime | 反应时间测试 |
| `/number-memory` | NumberMemory | 数字记忆测试 |
| `/typing` | TypingSpeed | 打字速度测试 |
| `/aim` | AimTrainer | 瞄准测试 |
| `/chimp` | ChimpTest | 黑猩猩测试 |
| `/color-vision` | ColorVision | 颜色视觉测试 |
| `/sequence-memory` | SequenceMemory | 序列记忆测试 |
| `/stroop` | StroopTest | Stroop 效应测试 |
| `/math-speed` | MathSpeed | 数学速度测试 |

---

## 6. 关键实现要点

### 6.1 计时精度
使用 `performance.now()` 获取高精度时间戳，确保毫秒级精度。

### 6.2 测试流程状态机
每个测试页面内部使用状态枚举管理流程：
- `idle`: 初始状态，显示说明
- `playing`: 测试进行中
- `result`: 显示结果

### 6.3 动画实现
- CSS Transition / Animation 实现简单过渡
- Tailwind 内置动画类 + 自定义 keyframes
- 避免使用重型动画库，保持轻量

### 6.4 响应式
- 移动端优先设计
- 使用 Tailwind 的断点（sm, md, lg）
- 触摸设备优化交互

---

## 7. 构建与部署

- 构建命令：`npm run build`
- 类型检查：`npm run check`
- Lint：`npm run lint`
- 纯静态产物，可部署到任何静态托管平台
