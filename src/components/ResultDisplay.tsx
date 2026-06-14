import type { TestMeta } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';
import { Trophy, RotateCcw, Home, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultDisplayProps {
  test: TestMeta;
  score: number;
  stats?: { label: string; value: string }[];
  onRetry: () => void;
}

export default function ResultDisplay({ test, score, stats, onRetry }: ResultDisplayProps) {
  const bestScore = useScoreStore((s) => s.getBestScore(test.id));
  const isNewBest = bestScore === score;

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
      </div>
    </div>
  );
}
