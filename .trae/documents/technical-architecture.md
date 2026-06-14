## 1. 架构设计

```mermaid
graph TD
    "前端 React SPA" --> "路由管理 React Router"
    "路由管理 React Router" --> "首页"
    "路由管理 React Router" --> "测试页（12个）"
    "路由管理 React Router" --> "结果页"
    "前端 React SPA" --> "状态管理 Zustand"
    "前端 React SPA" --> "Canvas 渲染引擎"
    "前端 React SPA" --> "LocalStorage 持久化"
```

纯前端 SPA 架构，无需后端服务。所有测试逻辑、计分、数据存储均在浏览器端完成。

## 2. 技术说明

- **前端框架**: React@18 + TypeScript
- **样式方案**: TailwindCSS@3 + CSS Modules（复杂动画）
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand（轻量级，测试状态管理）
- **动画**: Framer Motion
- **图表**: Canvas API 自绘（雷达图、条形图）
- **数据持久化**: LocalStorage
- **后端**: 无（纯前端项目）
- **数据库**: 无（LocalStorage 替代）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页，展示所有测试项目 |
| `/test/:id` | 测试页面，根据 id 加载不同测试 |
| `/result/:id` | 结果页面，展示测试成绩和对比 |

## 4. 组件架构

```mermaid
graph TD
    "App" --> "Layout"
    "Layout" --> "Navbar"
    "Layout" --> "RouterOutlet"
    "RouterOutlet" --> "HomePage"
    "RouterOutlet" --> "TestPage"
    "RouterOutlet" --> "ResultPage"
    "HomePage" --> "HeroSection"
    "HomePage" --> "TestCardGrid"
    "TestCardGrid" --> "TestCard"
    "TestPage" --> "TestInstructions"
    "TestPage" --> "TestArea"
    "TestPage" --> "TestHUD"
    "TestArea" --> "ReactionTest"
    "TestArea" --> "SequenceMemoryTest"
    "TestArea" --> "TypingTest"
    "TestArea" --> "AimTest"
    "TestArea" --> "ChimpTest"
    "TestArea" --> "VisualMemoryTest"
    "TestArea" --> "VerbalMemoryTest"
    "TestArea" --> "ColorMatchTest"
    "TestArea" --> "TimePerceptionTest"
    "TestArea" --> "SpeedTest"
    "TestArea" --> "NumberCalcTest"
    "TestArea" --> "RhythmTest"
    "ResultPage" --> "ScoreDisplay"
    "ResultPage" --> "PercentileChart"
    "ResultPage" --> "RadarChart"
```

## 5. 数据模型

### 5.1 测试结果数据

```typescript
interface TestResult {
  testId: string
  score: number
  accuracy: number
  duration: number
  timestamp: number
  details: Record<string, number>
}

interface UserProfile {
  results: TestResult[]
  radarData: Record<string, number>
}
```

### 5.2 测试配置数据

```typescript
interface TestConfig {
  id: string
  name: string
  icon: string
  description: string
  category: 'reaction' | 'memory' | 'visual' | 'aim' | 'calculation' | 'perception'
  difficulty: 'easy' | 'medium' | 'hard'
  avgScore: number
}
```

### 5.3 LocalStorage 存储结构

键名: `human-benchmark-results`

```json
{
  "results": [
    {
      "testId": "reaction",
      "score": 245,
      "accuracy": 100,
      "duration": 5000,
      "timestamp": 1700000000000,
      "details": {}
    }
  ]
}
```
