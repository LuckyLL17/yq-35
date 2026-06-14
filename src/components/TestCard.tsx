import { Link } from 'react-router-dom';
import type { TestMeta } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';
import { Zap, Brain, Keyboard, Target, Rabbit, Palette, Repeat, Filter, Calculator } from 'lucide-react';

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

interface TestCardProps {
  test: TestMeta;
  index: number;
}

export default function TestCard({ test, index }: TestCardProps) {
  const Icon = iconMap[test.id] ?? Zap;
  const bestScore = useScoreStore((s) => s.getBestScore(test.id));
  const attempts = useScoreStore((s) => s.getAttempts(test.id));

  return (
    <Link
      to={test.route}
      className="glass-card-hover group relative overflow-hidden p-6 flex flex-col gap-4 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500"
        style={{ backgroundColor: test.color }}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300"
          style={{
            boxShadow: `0 0 0 1px ${test.color}20`,
          }}
        >
          <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" style={{ color: test.color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg">{test.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {attempts > 0 && (
              <span className="text-xs text-white/40">已尝试 {attempts} 次</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-white/50 leading-relaxed">{test.description}</p>

      <div className="relative mt-auto flex items-center justify-between">
        {bestScore !== null ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">最佳成绩:</span>
            <span className="font-mono font-bold text-sm" style={{ color: test.color }}>
              {bestScore} {test.unit}
            </span>
          </div>
        ) : (
          <span className="text-xs text-white/30">尚未测试</span>
        )}
        <div className="flex items-center gap-1 text-xs font-medium text-white/60 group-hover:text-white transition-colors">
          开始测试
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
