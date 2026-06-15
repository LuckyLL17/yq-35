import { useMemo, useState } from 'react';
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
  Legend,
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
} from 'lucide-react';
import { useScoreStore } from '@/store/useScoreStore';
import { TESTS, ABILITIES } from '@/types';
import type { TestId } from '@/types';
import { cn } from '@/lib/utils';

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
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Profile() {
  const store = useScoreStore();
  const [selectedTest, setSelectedTest] = useState<TestId>('reaction');

  const totalAttempts = store.getTotalAttempts();
  const totalDuration = store.getTotalDuration();
  const completedTests = store.getCompletedTests();
  const totalTests = TESTS.length;
  const completionRate = Math.round((completedTests / totalTests) * 100);

  const progressData = useMemo(() => {
    return [
      { name: '已完成', value: completedTests },
      { name: '未完成', value: totalTests - completedTests },
    ];
  }, [completedTests, totalTests]);

  const PROGRESS_COLORS = ['#00d4ff', 'rgba(255,255,255,0.1)'];

  const radarData = useMemo(() => {
    return ABILITIES.map((a) => ({
      ability: a.name,
      score: store.getAbilityScore(a.id) || 0,
      fullMark: 100,
    }));
  }, [store]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl">
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
                <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                </div>
                <div className="text-xs text-white/40">完成率</div>
              </div>
              <div className="font-display font-black text-3xl text-neon-green">{completionRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
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

            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-neon-purple" />
                <h2 className="font-display font-bold text-lg">能力雷达图</h2>
              </div>
              <div className="h-72">
                {hasAnyData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis
                        dataKey="ability"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      />
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

          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
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
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}
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
                  <Link
                    to={selectedTestMeta.route}
                    className="mt-3 text-neon-cyan text-sm hover:underline"
                  >
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
                  <div className="font-display font-bold text-xl text-white">
                    {selectedHistory.length} 次
                  </div>
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
      </main>
    </div>
  );
}
