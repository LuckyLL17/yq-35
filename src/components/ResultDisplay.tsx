import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { TestMeta } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';
import { useTrainingStore } from '@/store/useTrainingStore';
import { Trophy, RotateCcw, Home, Star, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShareResult from './ShareResult';

interface ResultDisplayProps {
  test: TestMeta;
  score: number;
  stats?: { label: string; value: string }[];
  onRetry: () => void;
}

export default function ResultDisplay({ test, score, stats, onRetry }: ResultDisplayProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTrainingMode = searchParams.get('training') === '1';
  const bestScore = useScoreStore((s) => s.getBestScore(test.id));
  const isNewBest = bestScore === score;
  const currentSession = useTrainingStore((s) => s.currentSession);
  const completeCurrentRound = useTrainingStore((s) => s.completeCurrentRound);
  const getCurrentTest = useTrainingStore((s) => s.getCurrentTest);

  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    if (isTrainingMode && currentSession && !recorded) {
      completeCurrentRound(score);
      setRecorded(true);
    }
  }, [isTrainingMode, currentSession, score, completeCurrentRound, recorded]);

  const currentTestInfo = getCurrentTest();

  const handleContinueTraining = () => {
    navigate('/training/session');
  };

  if (isTrainingMode && currentSession) {
    const item = currentSession.items[currentSession.currentItemIndex];
    const hasMoreRounds = item && item.currentRound < item.rounds;
    const allDone = currentSession.completed;

    return (
      <div className="glass-card p-8 md:p-12 text-center animate-fade-in-scale">
        {isNewBest && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-yellow/20 border border-neon-yellow/40 text-neon-yellow animate-pop-in">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">新纪录！</span>
          </div>
        )}

        <div className="mb-2 text-white/50">本轮成绩</div>
        <div className="mb-6">
          <span
            className="font-display font-black text-6xl md:text-8xl tracking-tighter"
            style={{ color: test.color, textShadow: `0 0 40px ${test.color}40` }}
          >
            {score}
          </span>
          <span className="text-2xl text-white/40 ml-2">{test.unit}</span>
        </div>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <div className="text-xs text-white/40 mb-1">{stat.label}</div>
                <div className="font-mono text-xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span className="text-white/60">
              训练进度：
              <span className="font-bold text-white">
                {currentSession.currentItemIndex + 1} / {currentSession.items.length}
              </span>
              <span className="text-white/40 mx-2">·</span>
              第 <span className="font-bold text-white">{item?.currentRound ?? 0}</span> / {item?.rounds ?? 0} 轮
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasMoreRounds ? (
            <>
              <button onClick={onRetry} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
                <RotateCcw className="w-4 h-4" />
                继续下一轮
              </button>
              <button
                onClick={handleContinueTraining}
                className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <ArrowRight className="w-4 h-4" />
                返回训练列表
              </button>
              <ShareResult test={test} score={score} isNewBest={isNewBest} />
            </>
          ) : (
            <>
              <button
                onClick={handleContinueTraining}
                className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <ArrowRight className="w-4 h-4" />
                {allDone ? '查看训练结果' : '下一项测试'}
              </button>
              <button onClick={onRetry} className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center">
                <RotateCcw className="w-4 h-4" />
                再测一次
              </button>
              <ShareResult test={test} score={score} isNewBest={isNewBest} />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 md:p-12 text-center animate-fade-in-scale">
      {isNewBest && (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-yellow/20 border border-neon-yellow/40 text-neon-yellow animate-pop-in">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-medium">新纪录！</span>
        </div>
      )}

      <div className="mb-2 text-white/50">你的成绩</div>
      <div className="mb-6">
        <span
          className="font-display font-black text-6xl md:text-8xl tracking-tighter"
          style={{ color: test.color, textShadow: `0 0 40px ${test.color}40` }}
        >
          {score}
        </span>
        <span className="text-2xl text-white/40 ml-2">{test.unit}</span>
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="text-xs text-white/40 mb-1">{stat.label}</div>
              <div className="font-mono text-xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {bestScore !== null && !isNewBest && (
        <div className="mb-8 flex items-center justify-center gap-2 text-white/50">
          <Trophy className="w-4 h-4" style={{ color: test.color }} />
          <span>
            历史最佳: <span className="font-mono font-bold" style={{ color: test.color }}>{bestScore} {test.unit}</span>
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button onClick={onRetry} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <RotateCcw className="w-4 h-4" />
          再试一次
        </button>
        <Link to="/" className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Home className="w-4 h-4" />
          返回首页
        </Link>
        <ShareResult test={test} score={score} isNewBest={isNewBest} />
      </div>
    </div>
  );
}
