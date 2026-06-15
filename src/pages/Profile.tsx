import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  Clock,
  Target,
  Trophy,
  Zap,
  Brain,
  Keyboard,
  Rabbit,
  Palette,
  Repeat,
  Filter,
  Calculator,
  TrendingUp,
  Activity,
  Calendar,
  Award,
  ChevronDown,
  Search,
  Lock,
  Sparkles,
  CalendarRange,
  AlertCircle,
  Check,
  X as XIcon,
} from 'lucide-react';
import { useScoreStore } from '@/store/useScoreStore';
import { TESTS, ABILITIES } from '@/types';
import type { TestId, TestRecord, AchievementRarity, Achievement } from '@/types';
import { cn } from '@/lib/utils';
import { ACHIEVEMENTS, RARITY_INFO } from '@/data/achievements';
import AchievementDetailModal from '@/components/AchievementDetailModal';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  reaction: Zap,
  'number-memory': Brain,
  typing: Keyboard,
  aim: Target,
  chimp: Rabbit,
  'color-vision': Palette,
  'sequence-memory': Repeat,
  stroop: Filter,
  'math-speed': Calculator,
};

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
  if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`;
  return `${seconds}秒`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateRangeStart(label: string): number | undefined {
  switch (label) {
    case 'today': {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case '7d': {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case '30d': {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case '90d': {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    default:
      return undefined;
  }
}

const QUICK_DATE_OPTIONS = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: '7d', label: '最近 7 天' },
  { value: '30d', label: '最近 30 天' },
  { value: '90d', label: '最近 90 天' },
  { value: 'custom', label: '自定义' },
];

type RarityFilter = 'all' | AchievementRarity;
const RARITY_FILTERS: { value: RarityFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'common', label: '普通' },
  { value: 'rare', label: '稀有' },
  { value: 'epic', label: '史诗' },
  { value: 'legendary', label: '传说' },
];

const RARITY_ORDER: AchievementRarity[] = ['legendary', 'epic', 'rare', 'common'];

export default function Profile() {
  const store = useScoreStore();
  const [selectedTest, setSelectedTest] = useState<TestId>('reaction');
  const [filterTests, setFilterTests] = useState<TestId[]>([]);
  const [filterQuickDate, setFilterQuickDate] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [customDateError, setCustomDateError] = useState<string>('');

  const [filterRarity, setFilterRarity] = useState<RarityFilter>('all');
  const [showTestDropdown, setShowTestDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'achievements'>('stats');

  const [detailAchievement, setDetailAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    store.checkAchievementsOnProfileLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setShowTestDropdown(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (filterQuickDate !== 'custom') {
      setCustomDateError('');
      return;
    }
    if (customStartDate && customEndDate) {
      const s = new Date(customStartDate).getTime();
      const e = new Date(customEndDate).getTime();
      if (s > e) {
        setCustomDateError('开始日期不能晚于结束日期');
      } else {
        setCustomDateError('');
      }
    } else {
      setCustomDateError('');
    }
  }, [customStartDate, customEndDate, filterQuickDate]);

  const totalAttempts = store.getTotalAttempts();
  const totalDuration = store.getTotalDuration();
  const completedTests = store.getCompletedTests();
  const totalTests = TESTS.length;
  const completionRate = Math.round((completedTests / totalTests) * 100);

  const progressData = useMemo(
    () => [
      { name: '已完成', value: completedTests },
      { name: '未完成', value: totalTests - completedTests },
    ],
    [completedTests, totalTests],
  );

  const PROGRESS_COLORS = ['#00d4ff', 'rgba(255,255,255,0.1)'];

  const radarData = useMemo(
    () =>
      ABILITIES.map((a) => ({
        ability: a.name,
        score: store.getAbilityScore(a.id) || 0,
        fullMark: 100,
      })),
    [store],
  );

  const historyData = useMemo(() => {
    const history = store.getHistory(selectedTest);
    const test = TESTS.find((t) => t.id === selectedTest)!;
    if (history.length === 0) return [];

    let runningBest = test.higherIsBetter ? -Infinity : Infinity;
    return history.map((point, idx) => {
      if (test.higherIsBetter) {
        runningBest = Math.max(runningBest, point.score);
      } else {
        runningBest = Math.min(runningBest, point.score);
      }
      return {
        index: idx + 1,
        date: formatDate(point.timestamp),
        score: point.score,
        best: runningBest,
      };
    });
  }, [store, selectedTest]);

  const selectedTestMeta = TESTS.find((t) => t.id === selectedTest)!;
  const selectedHistory = store.getHistory(selectedTest);
  const selectedBest = store.getBestScore(selectedTest);
  const hasAnyData = totalAttempts > 0;

  const effectiveStartDate = useMemo<number | undefined>(() => {
    if (filterQuickDate === 'custom') {
      if (!customStartDate) return undefined;
      const d = new Date(customStartDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    return dateRangeStart(filterQuickDate);
  }, [filterQuickDate, customStartDate]);

  const effectiveEndDate = useMemo<number | undefined>(() => {
    if (filterQuickDate !== 'custom' || !customEndDate) return undefined;
    const d = new Date(customEndDate);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, [filterQuickDate, customEndDate]);

  const customRangeInvalid = filterQuickDate === 'custom' && customDateError !== '';

  const filteredRecords: TestRecord[] = useMemo(() => {
    if (customRangeInvalid) return [];
    return store.getTestRecordsByFilter(
      filterTests.length > 0 ? filterTests : undefined,
      effectiveStartDate,
      effectiveEndDate,
    );
  }, [store, filterTests, effectiveStartDate, effectiveEndDate, customRangeInvalid]);

  const recordsByDate = useMemo(() => {
    const groups = new Map<string, TestRecord[]>();
    for (const r of filteredRecords) {
      const key = new Date(r.timestamp).toDateString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    return Array.from(groups.entries());
  }, [filteredRecords]);

  const unlockedCount = store.getUnlockedCount();
  const totalAchievements = ACHIEVEMENTS.length;
  const achievementProgress = Math.round((unlockedCount / totalAchievements) * 100);

  const displayedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => filterRarity === 'all' || a.rarity === filterRarity).sort((a, b) => {
      const ra = RARITY_ORDER.indexOf(a.rarity);
      const rb = RARITY_ORDER.indexOf(b.rarity);
      if (ra !== rb) return ra - rb;
      const ua = store.isAchievementUnlocked(a.id);
      const ub = store.isAchievementUnlocked(b.id);
      if (ua !== ub) return ua ? -1 : 1;
      return 0;
    });
  }, [filterRarity, store]);

  const toggleTestFilter = (id: TestId) => {
    setFilterTests((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  function quickDateLabel(): string {
    if (filterQuickDate === 'custom') {
      if (customStartDate || customEndDate) {
        return `${customStartDate || '...'} 至 ${customEndDate || '...'}`;
      }
      return '自定义';
    }
    return QUICK_DATE_OPTIONS.find((o) => o.value === filterQuickDate)?.label ?? '全部时间';
  }

  function computeProgressLabel(ach: Achievement): string | undefined {
    const ctx = {
      records: store.records,
      allTestRecords: store.getAllTestRecords(),
      completedTests: store.getCompletedTests(),
      totalAttempts: store.getTotalAttempts(),
      totalDuration: store.getTotalDuration(),
    };
    const id = ach.id;
    const best = (tid: string) => store.records[tid as TestId]?.bestScore ?? 0;
    switch (id) {
      case 'first-step':
        return `${Math.min(ctx.totalAttempts, 1)} / 1 次测试`;
      case 'explorer':
        return `${ctx.completedTests} / 3 种测试`;
      case 'jack-of-all-trades':
        return `${ctx.completedTests} / 9 种测试`;
      case 'persistent':
        return `${ctx.totalAttempts} / 25 次`;
      case 'dedicated':
        return `${ctx.totalAttempts} / 100 次`;
      case 'marathon':
        return `${Math.round(ctx.totalDuration / 60000)} / 30 分钟`;
      case 'record-breaker':
        return store.getAllTestRecords().some((r) => r.isNewRecord) ? '已刷新纪录' : '等待刷新纪录';
      case 'lightning-fast':
        return `${best('reaction') || 0} / 250 ms`;
      case 'speed-demon':
        return `${best('reaction') || 0} / 180 ms`;
      case 'memory-keeper':
        return `${best('number-memory') || 0} / 12 位`;
      case 'photographic-memory':
        return `${best('number-memory') || 0} / 20 位`;
      case 'typing-novice':
        return `${best('typing') || 0} / 40 WPM`;
      case 'typing-master':
        return `${best('typing') || 0} / 80 WPM`;
      case 'sharpshooter':
        return `${best('aim') ? `${best('aim')} ms` : '—'} / 400 ms`;
      case 'sniper':
        return `${best('aim') ? `${best('aim')} ms` : '—'} / 280 ms`;
      case 'smarter-than-chimp':
        return `${best('chimp') || 0} / 8 关`;
      case 'eagle-eye':
        return `${best('color-vision') || 0} / 25 级`;
      case 'sequence-master':
        return `${best('sequence-memory') || 0} / 12 轮`;
      case 'stroop-master':
        return `${best('stroop') || 0} / 60 分`;
      case 'human-calculator':
        return `${best('math-speed') || 0} / 40 题`;
      default:
        return undefined;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回首页</span>
          </Link>
          <h1 className="font-display text-xl font-bold text-gradient">用户档案</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-neon-cyan" />
                </div>
                <div className="text-xs text-white/40">已完成测试</div>
              </div>
              <div className="font-display font-black text-3xl">
                <span className="text-neon-cyan">{completedTests}</span>
                <span className="text-white/30 text-lg">/{totalTests}</span>
              </div>
            </div>

            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-neon-purple" />
                </div>
                <div className="text-xs text-white/40">累计测试次数</div>
              </div>
              <div className="font-display font-black text-3xl text-neon-purple">{totalAttempts}</div>
            </div>

            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-neon-pink/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-neon-pink" />
                </div>
                <div className="text-xs text-white/40">总测试时长</div>
              </div>
              <div className="font-display font-black text-2xl text-neon-pink">
                {totalDuration > 0 ? formatDuration(totalDuration) : '—'}
              </div>
            </div>

            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-neon-yellow/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-neon-yellow" />
                </div>
                <div className="text-xs text-white/40">成就 / 总数</div>
              </div>
              <div className="font-display font-black text-3xl">
                <span className="text-neon-yellow">{unlockedCount}</span>
                <span className="text-white/30 text-lg">/{totalAchievements}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-1.5 flex gap-1.5 animate-fade-in" style={{ animationDelay: '175ms' }}>
            {(
              [
                { id: 'stats', label: '统计概览', icon: Activity },
                { id: 'history', label: '历史记录', icon: Calendar },
                { id: 'achievements', label: '成就徽章', icon: Award },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all',
                    active
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5',
                  )}
                >
                  <Icon className={cn('w-4 h-4', active && 'text-neon-cyan')} />
                  {tab.label}
                  {tab.id === 'history' && filteredRecords.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan">
                      {filteredRecords.length}
                    </span>
                  )}
                  {tab.id === 'achievements' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-yellow/20 text-neon-yellow">
                      {achievementProgress}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-neon-cyan" />
                    <h2 className="font-display font-bold text-lg">测试完成度</h2>
                  </div>
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={progressData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {progressData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PROGRESS_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a26',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-4xl font-display font-black text-neon-cyan">{completionRate}%</div>
                      <div className="text-xs text-white/40 mt-1">测试完成度</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {TESTS.map((test) => {
                      const hasRecord = !!store.records[test.id];
                      const Icon = iconMap[test.id];
                      return (
                        <div
                          key={test.id}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all',
                            hasRecord ? 'bg-white/5' : 'bg-white/[0.02]',
                          )}
                        >
                          <Icon
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: hasRecord ? test.color : 'rgba(255,255,255,0.2)' }}
                          />
                          <span className={cn('truncate', hasRecord ? 'text-white/80' : 'text-white/30')}>
                            {test.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-5 h-5 text-neon-purple" />
                    <h2 className="font-display font-bold text-lg">能力雷达图</h2>
                  </div>
                  <div className="h-72">
                    {hasAnyData ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} outerRadius="70%">
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="ability" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                            axisLine={false}
                          />
                          <Radar
                            name="能力值"
                            dataKey="score"
                            stroke="#a855f7"
                            fill="#a855f7"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a26',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              color: '#fff',
                            }}
                            formatter={(value: number) => [`${value}分`, '能力值']}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/40">
                        <Brain className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">完成测试后显示能力分析</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-neon-cyan" />
                    <h2 className="font-display font-bold text-lg">最佳成绩历史曲线</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TESTS.map((test) => {
                      const Icon = iconMap[test.id];
                      const isActive = selectedTest === test.id;
                      return (
                        <button
                          key={test.id}
                          onClick={() => setSelectedTest(test.id)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                            isActive
                              ? 'text-white border'
                              : 'text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 border border-transparent',
                          )}
                          style={
                            isActive
                              ? {
                                  backgroundColor: `${test.color}20`,
                                  borderColor: `${test.color}60`,
                                  color: test.color,
                                }
                              : undefined
                          }
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{test.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-72">
                  {historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          label={{
                            value: selectedTestMeta.unit,
                            angle: -90,
                            position: 'insideLeft',
                            fill: 'rgba(255,255,255,0.4)',
                            fontSize: 11,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a26',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                          labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          name="本次成绩"
                          stroke={selectedTestMeta.color}
                          strokeWidth={2}
                          dot={{ fill: selectedTestMeta.color, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="best"
                          name="最佳成绩"
                          stroke="#a855f7"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/40">
                      <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-sm">暂无{selectedTestMeta.name}的测试记录</p>
                      <Link to={selectedTestMeta.route} className="mt-3 text-neon-cyan text-sm hover:underline">
                        去测试 →
                      </Link>
                    </div>
                  )}
                </div>

                {selectedBest !== null && selectedHistory.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs text-white/40 mb-1">当前最佳</div>
                      <div className="font-display font-bold text-xl" style={{ color: selectedTestMeta.color }}>
                        {selectedBest} {selectedTestMeta.unit}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs text-white/40 mb-1">测试次数</div>
                      <div className="font-display font-bold text-xl text-white">{selectedHistory.length} 次</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs text-white/40 mb-1">最近成绩</div>
                      <div className="font-display font-bold text-xl text-neon-purple">
                        {selectedHistory[selectedHistory.length - 1].score} {selectedTestMeta.unit}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs text-white/40 mb-1">累计时长</div>
                      <div className="font-display font-bold text-xl text-neon-pink">
                        {formatDuration(store.records[selectedTest]?.totalDuration ?? 0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-5">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon-cyan" />
                    <h2 className="font-display font-bold text-lg">历史测试记录</h2>
                    <span className="text-xs text-white/40 ml-2">共 {filteredRecords.length} 条</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="relative" ref={dropdownRef}>
                      <label className="text-[11px] text-white/40 mb-1.5 block tracking-wider uppercase">测试类型筛选</label>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTestDropdown((v) => !v);
                        }}
                        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:border-white/20 transition-all"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                          {filterTests.length === 0
                            ? '全部测试类型'
                            : filterTests.length === 1
                              ? TESTS.find((t) => t.id === filterTests[0])?.name
                              : `已选 ${filterTests.length} 种测试`}
                        </span>
                        <ChevronDown className={cn('w-4 h-4 text-white/40 transition-transform flex-shrink-0', showTestDropdown && 'rotate-180')} />
                      </button>
                      {showTestDropdown && (
                        <div className="absolute z-[100] top-[calc(100%+8px)] left-0 right-0 glass-card p-2 max-h-80 overflow-y-auto scrollbar-thin border border-white/15 shadow-2xl animate-fade-in-scale">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterTests([]);
                              setShowTestDropdown(false);
                            }}
                            className={cn(
                              'w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-1 flex items-center justify-between',
                              filterTests.length === 0 ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-white/70 hover:bg-white/5',
                            )}
                          >
                            <span>全部测试类型</span>
                            {filterTests.length === 0 && <Check className="w-4 h-4" />}
                          </button>
                          {TESTS.map((test) => {
                            const active = filterTests.includes(test.id);
                            const Icon = iconMap[test.id];
                            return (
                              <button
                                key={test.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTestFilter(test.id);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                                  'hover:bg-white/5',
                                )}
                                style={active ? { backgroundColor: `${test.color}15`, color: test.color } : { color: 'rgba(255,255,255,0.8)' }}
                              >
                                <span className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  <span>{test.name}</span>
                                </span>
                                {active && <Check className="w-4 h-4" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] text-white/40 mb-1.5 block tracking-wider uppercase">日期范围</label>
                      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/5 rounded-xl border border-white/10">
                        {QUICK_DATE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setFilterQuickDate(opt.value);
                              if (opt.value !== 'custom') {
                                setCustomStartDate('');
                                setCustomEndDate('');
                              }
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                              filterQuickDate === opt.value
                                ? 'bg-white/10 text-white'
                                : 'text-white/50 hover:text-white/80',
                            )}
                          >
                            {opt.value === 'custom' ? (
                              <span className="flex items-center gap-1">
                                <CalendarRange className="w-3 h-3" />
                                {opt.label}
                              </span>
                            ) : (
                              opt.label
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {filterQuickDate === 'custom' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-white/40 mb-1.5 block">开始日期</label>
                          <input
                            type="date"
                            value={customStartDate}
                            max={customEndDate || undefined}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.07] transition-all [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-white/40 mb-1.5 block">结束日期</label>
                          <input
                            type="date"
                            value={customEndDate}
                            min={customStartDate || undefined}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/[0.07] transition-all [color-scheme:dark]"
                          />
                        </div>
                      </div>
                      {customDateError && (
                        <div className="flex items-center gap-2 text-xs text-neon-red px-3 py-2 rounded-xl bg-neon-red/10 border border-neon-red/30">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {customDateError}
                        </div>
                      )}
                      {!customDateError && (customStartDate || customEndDate) && (
                        <div className="flex items-center gap-2 text-xs text-neon-green px-3 py-2 rounded-xl bg-neon-green/10 border border-neon-green/30">
                          <Check className="w-4 h-4 flex-shrink-0" />
                          自定义范围: {quickDateLabel()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {filterTests.map((id) => {
                      const test = TESTS.find((t) => t.id === id)!;
                      const Icon = iconMap[id];
                      return (
                        <button
                          key={id}
                          onClick={() => toggleTestFilter(id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                          style={{ backgroundColor: `${test.color}18`, color: test.color }}
                        >
                          <Icon className="w-3 h-3" />
                          {test.name}
                          <XIcon className="w-3 h-3 ml-0.5 opacity-60" />
                        </button>
                      );
                    })}
                    {(filterTests.length > 0 || (filterQuickDate === 'custom' && (customStartDate || customEndDate))) && (
                      <button
                        onClick={() => {
                          setFilterTests([]);
                          setFilterQuickDate('all');
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                        className="text-xs text-white/40 hover:text-white/70 px-2 py-1 flex items-center gap-1"
                      >
                        <XIcon className="w-3 h-3" />
                        清空筛选
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {recordsByDate.length === 0 || customRangeInvalid ? (
                  <div className="glass-card p-16 flex flex-col items-center justify-center text-white/40">
                    <Calendar className="w-14 h-14 mb-4 opacity-25" />
                    <p className="text-base font-medium mb-1">
                      {customRangeInvalid ? '请修正日期范围' : '暂无测试记录'}
                    </p>
                    <p className="text-sm text-white/30 mb-2">
                      {customRangeInvalid ? customDateError : '调整筛选条件或去完成一些测试吧'}
                    </p>
                    {!customRangeInvalid && (
                      <Link to="/" className="mt-3 btn-primary text-sm">
                        返回首页开始测试
                      </Link>
                    )}
                  </div>
                ) : (
                  recordsByDate.map(([dateKey, dayRecords]) => {
                    const date = new Date(dateKey);
                    const isToday = new Date().toDateString() === dateKey;
                    return (
                      <div key={dateKey} className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-white/40 leading-none">
                              {isToday ? '今天' : `${date.getMonth() + 1}月`}
                            </span>
                            <span className="font-display font-bold text-lg text-white leading-none mt-1">
                              {date.getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white/80">
                              {isToday ? '今天' : `${date.getMonth() + 1}月${date.getDate()}日 · 周${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`}
                            </div>
                            <div className="text-xs text-white/40">
                              {dayRecords.length} 条测试记录 · 总时长{' '}
                              {formatDuration(dayRecords.reduce((s, r) => s + r.duration, 0))}
                            </div>
                          </div>
                        </div>

                        <div className="relative pl-6 space-y-3 border-l border-white/10 ml-6">
                          {dayRecords
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .map((record) => {
                              const test = TESTS.find((t) => t.id === record.testId)!;
                              const Icon = iconMap[record.testId];
                              const t = new Date(record.timestamp);
                              return (
                                <div key={record.id} className="relative pl-4">
                                  <div
                                    className="absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 z-10"
                                    style={{
                                      backgroundColor: '#0a0a0f',
                                      borderColor: test.color,
                                      boxShadow: `0 0 12px ${test.color}66`,
                                    }}
                                  />
                                  <div className="glass-card p-4 hover:bg-white/[0.07] transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div
                                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                          style={{ backgroundColor: `${test.color}18` }}
                                        >
                                          <Icon className="w-5 h-5" style={{ color: test.color }} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-white text-sm">{test.name}</span>
                                            {record.isNewRecord && (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30">
                                                <Sparkles className="w-3 h-3" />
                                                新纪录
                                              </span>
                                            )}
                                          </div>
                                          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                                            <span className="font-display font-black text-2xl" style={{ color: test.color }}>
                                              {record.score}
                                            </span>
                                            <span className="text-xs text-white/50">{test.unit}</span>
                                            {record.improvement !== undefined && record.improvement > 0 && (
                                              <span className="text-[11px] text-neon-green font-medium">
                                                ↑ 提升 {record.improvement} {test.unit}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <span className="text-[11px] text-white/40 font-mono">
                                          {t.getHours().toString().padStart(2, '0')}:{t.getMinutes().toString().padStart(2, '0')}:
                                          {t.getSeconds().toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-[11px] text-white/40 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatDuration(record.duration)}
                                        </span>
                                        <Link
                                          to={test.route}
                                          className="text-[11px] text-neon-cyan hover:underline mt-1"
                                        >
                                          再测一次
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-5 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border-2 border-yellow-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                      <Award className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-display font-black text-2xl text-white">
                        {unlockedCount} <span className="text-white/30 text-xl">/ {totalAchievements}</span>
                      </div>
                      <div className="text-sm text-white/50 mt-0.5">已解锁成就 · {achievementProgress}%</div>
                      <div className="mt-3 w-72 max-w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-yellow"
                          style={{ width: `${achievementProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/5 rounded-xl border border-white/10">
                    {RARITY_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFilterRarity(f.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          filterRarity === f.value ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80',
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {RARITY_ORDER.map((r) => {
                    const info = RARITY_INFO[r];
                    const count = ACHIEVEMENTS.filter((a) => a.rarity === r).length;
                    const unlocked = ACHIEVEMENTS.filter(
                      (a) => a.rarity === r && store.isAchievementUnlocked(a.id),
                    ).length;
                    return (
                      <div
                        key={r}
                        className={cn(
                          'rounded-xl p-3 border bg-gradient-to-br cursor-pointer hover:scale-[1.02] transition-all',
                          info.bg,
                          info.border,
                        )}
                        onClick={() => setFilterRarity(r)}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                          {info.label}
                        </div>
                        <div className="font-display font-black text-xl">
                          <span className="text-white">{unlocked}</span>
                          <span className="text-white/30 text-sm"> / {count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedAchievements.map((ach) => {
                  const unlocked = store.isAchievementUnlocked(ach.id);
                  const info = RARITY_INFO[ach.rarity];
                  const unlockedAt = store.unlockedAchievements.find((u) => u.id === ach.id)?.unlockedAt;
                  return (
                    <button
                      key={ach.id}
                      onClick={() => setDetailAchievement(ach)}
                      className={cn(
                        'relative rounded-2xl p-5 border-2 transition-all overflow-hidden text-left cursor-pointer',
                        unlocked
                          ? cn('bg-gradient-to-br', info.bg, info.border, info.glow, 'hover:scale-[1.03] hover:-translate-y-1')
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]',
                      )}
                    >
                      {unlocked && (
                        <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-neon-green/20 text-neon-green border border-neon-green/40 z-10">
                          已解锁
                        </div>
                      )}
                      {!unlocked && (
                        <div className="absolute top-3 right-3 z-10">
                          <Lock className="w-4 h-4 text-white/30" />
                        </div>
                      )}

                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border-2 transition-all',
                        )}
                        style={
                          unlocked
                            ? {
                                backgroundColor: `${ach.color}22`,
                                borderColor: `${ach.color}aa`,
                                boxShadow: `0 0 25px ${ach.color}44, inset 0 0 20px ${ach.color}22`,
                              }
                            : {
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderColor: 'rgba(255,255,255,0.1)',
                              }
                        }
                      >
                        <span className={cn('text-3xl', !unlocked && 'opacity-40 grayscale')}>
                          {unlocked ? ach.icon : '🔒'}
                        </span>
                      </div>

                      <div
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-widest mb-1.5',
                        )}
                        style={unlocked ? { color: ach.color } : { color: 'rgba(255,255,255,0.3)' }}
                      >
                        {info.label}
                      </div>

                      <h3
                        className={cn(
                          'font-display font-bold text-lg mb-1.5',
                          unlocked ? 'text-white' : 'text-white/50',
                        )}
                      >
                        {ach.name}
                      </h3>

                      <p className={cn('text-xs leading-relaxed mb-3', unlocked ? 'text-white/65' : 'text-white/30')}>
                        {ach.description}
                      </p>

                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={cn(unlocked ? 'text-white/50' : 'text-white/30')}>
                            {unlocked ? '解锁时间' : '进度'}
                          </span>
                          <span
                            className={cn(
                              'font-medium',
                              unlocked ? 'text-white/70' : 'text-white/50',
                            )}
                          >
                            {unlocked && unlockedAt
                              ? formatDateTime(unlockedAt)
                              : computeProgressLabel(ach) ?? '—'}
                          </span>
                        </div>
                        {!unlocked && (
                          <div className="mt-2 text-[10px] text-neon-cyan/70 flex items-center justify-end gap-0.5">
                            点击查看详情
                            <ArrowLeft className="w-3 h-3 rotate-180" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {detailAchievement && (
        <AchievementDetailModal
          achievement={detailAchievement}
          unlocked={store.isAchievementUnlocked(detailAchievement.id)}
          unlockedAt={store.unlockedAchievements.find((u) => u.id === detailAchievement.id)?.unlockedAt}
          progressLabel={computeProgressLabel(detailAchievement)}
          onClose={() => setDetailAchievement(null)}
        />
      )}
    </div>
  );
}
