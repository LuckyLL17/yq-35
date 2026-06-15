import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  Trophy,
  Target,
  X,
  ChevronRight,
  Zap,
  Brain,
  Keyboard,
  Rabbit,
  Palette,
  Repeat,
  Filter,
  Calculator,
  Award,
} from 'lucide-react';
import { useTrainingStore } from '@/store/useTrainingStore';
import { useScoreStore } from '@/store/useScoreStore';
import { TESTS } from '@/types';
import type { TrainingSessionItem } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

export default function TrainingSessionPage() {
  const navigate = useNavigate();
  const session = useTrainingStore((s) => s.currentSession);
  const getCurrentTest = useTrainingStore((s) => s.getCurrentTest);
  const nextItem = useTrainingStore((s) => s.nextItem);
  const completeSession = useTrainingStore((s) => s.completeSession);
  const cancelSession = useTrainingStore((s) => s.cancelSession);
  const getSessionProgress = useTrainingStore((s) => s.getSessionProgress);
  const markDailyCompleted = useTrainingStore((s) => s.markDailyCompleted);
  const dailyTraining = useTrainingStore((s) => s.dailyTraining);
  const getBestScore = useScoreStore((s) => s.getBestScore);

  const [showComplete, setShowComplete] = useState(false);

  const currentTest = getCurrentTest();
  const progress = getSessionProgress();

  useEffect(() => {
    if (!session) {
      navigate('/training');
    }
  }, [session, navigate]);

  useEffect(() => {
    if (session && !session.completed) {
      const currentItem = session.items[session.currentItemIndex];
      if (currentItem?.completed) {
        nextItem();
      }
    }
  }, [session, nextItem]);

  useEffect(() => {
    if (session?.completed) {
      setShowComplete(true);
      completeSession();
      if (dailyTraining && session.planId === dailyTraining.plan.id) {
        markDailyCompleted();
      }
    }
  }, [session?.completed]);

  if (!session) return null;

  const handleStartTest = () => {
    if (!currentTest) return;
    const test = TESTS.find((t) => t.id === currentTest.testId);
    if (test) {
      navigate(`${test.route}?training=1`);
    }
  };

  const handleContinue = () => {
    nextItem();
    const newCurrent = getCurrentTest();
    if (!newCurrent) {
      completeSession();
    }
  };

  const handleCancel = () => {
    if (confirm('确定要退出训练吗？训练进度将不会保存。')) {
      cancelSession();
      navigate('/training');
    }
  };

  const handleFinish = () => {
    cancelSession();
    navigate('/training');
  };

  const totalRounds = session.items.reduce((sum, item) => sum + item.rounds, 0);
  const completedRounds = session.items.reduce((sum, item) => sum + item.scores.length, 0);

  if (showComplete && session.completed) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl">
          <div className="container py-4 flex items-center justify-between">
            <button onClick={handleFinish} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">返回训练</span>
            </button>
          </div>
        </header>

        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="max-w-lg w-full text-center animate-fade-in-scale">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_40px_rgba(0,212,255,0.4)] mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-black mb-2">训练完成！</h1>
              <p className="text-white/50">太棒了，你完成了今天的全部训练</p>
            </div>

            <div className="glass-card p-6 mb-6">
              <div className="text-lg font-medium mb-4">{session.planName}</div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-neon-cyan">{session.items.length}</div>
                  <div className="text-xs text-white/40">测试项目</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-neon-purple">{totalRounds}</div>
                  <div className="text-xs text-white/40">总轮次</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-neon-green">
                    {session.endTime && session.startTime
                      ? Math.round((session.endTime - session.startTime) / 1000)
                      : 0}s
                  </div>
                  <div className="text-xs text-white/40">用时</div>
                </div>
              </div>

              <div className="space-y-2">
                {session.items.map((item, index) => {
                  const test = TESTS.find((t) => t.id === item.testId);
                  const best = item.scores.length > 0
                    ? (test?.higherIsBetter
                        ? Math.max(...item.scores)
                        : Math.min(...item.scores))
                    : null;
                  const Icon = iconMap[item.testId] ?? Target;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${test?.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: test?.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{test?.name}</div>
                        <div className="text-xs text-white/40">
                          {item.scores.length} / {item.rounds} 轮
                        </div>
                      </div>
                      {best !== null && (
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm" style={{ color: test?.color }}>
                            {best} {test?.unit}
                          </div>
                          <div className="text-xs text-white/40">最佳</div>
                        </div>
                      )}
                      <CheckCircle className="w-5 h-5 text-neon-green" />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30 transition-all font-medium"
            >
              返回训练列表
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentItem = session.items[session.currentItemIndex];
  const currentTestMeta = currentTest ? TESTS.find((t) => t.id === currentTest.testId) : null;
  const CurrentIcon = currentTestMeta ? (iconMap[currentTestMeta.id] ?? Target) : Target;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={handleCancel} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
              <span className="font-medium text-sm">退出训练</span>
            </button>
            <div className="text-sm font-medium">{session.planName}</div>
            <div className="text-sm text-white/40">
              {completedRounds} / {totalRounds}
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          {currentTest && currentTestMeta && (
            <div className="glass-card p-8 mb-8 text-center animate-fade-in">
              <div className="mb-2 text-sm text-white/40">当前测试 · 第 {currentTest.round} / {currentTest.totalRounds} 轮</div>
              <div
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `${currentTestMeta.color}15`,
                  border: `1px solid ${currentTestMeta.color}30`,
                }}
              >
                <CurrentIcon className="w-10 h-10" style={{ color: currentTestMeta.color }} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">{currentTestMeta.name}</h2>
              <p className="text-white/50 mb-6 max-w-md mx-auto">{currentTestMeta.description}</p>

              {getBestScore(currentTest.testId as any) !== null && (
                <div className="mb-6 flex items-center justify-center gap-2 text-sm text-white/50">
                  <Trophy className="w-4 h-4" style={{ color: currentTestMeta.color }} />
                  <span>
                    历史最佳:{' '}
                    <span className="font-mono font-bold" style={{ color: currentTestMeta.color }}>
                      {getBestScore(currentTest.testId as any)} {currentTestMeta.unit}
                    </span>
                  </span>
                </div>
              )}

              <button
                onClick={handleStartTest}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: `${currentTestMeta.color}20`,
                  color: currentTestMeta.color,
                  border: `2px solid ${currentTestMeta.color}50`,
                  boxShadow: `0 0 30px ${currentTestMeta.color}20`,
                }}
              >
                <Play className="w-5 h-5 fill-current" />
                开始测试
              </button>
            </div>
          )}

          <div>
            <h3 className="font-display font-bold text-lg mb-4">训练项目</h3>
            <div className="space-y-3">
              {session.items.map((item: TrainingSessionItem, index: number) => {
                const test = TESTS.find((t) => t.id === item.testId);
                const Icon = iconMap[item.testId] ?? Target;
                const isCurrent = index === session.currentItemIndex && !item.completed;
                const isCompleted = item.completed;
                const avgScore = item.scores.length > 0
                  ? (test?.higherIsBetter
                      ? Math.max(...item.scores)
                      : Math.min(...item.scores))
                  : null;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-white/5 border-neon-cyan/40 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                        : isCompleted
                          ? 'bg-white/5 border-white/10'
                          : 'bg-white/[0.02] border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-neon-green" />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${test?.color}15`,
                            border: `1px solid ${test?.color}30`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: test?.color }} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{test?.name}</span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan">
                            进行中
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.completed ? item.scores.length : item.currentRound} / {item.rounds} 轮
                        </span>
                        {avgScore !== null && (
                          <span className="text-xs text-white/40">
                            最佳:{' '}
                            <span className="font-mono" style={{ color: test?.color }}>
                              {avgScore} {test?.unit}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isCurrent ? (
                        <ChevronRight className="w-5 h-5 text-neon-cyan" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
