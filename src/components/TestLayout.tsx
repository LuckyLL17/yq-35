import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import type { TestMeta } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

interface TestLayoutProps {
  test: TestMeta;
  children: React.ReactNode;
}

export default function TestLayout({ test, children }: TestLayoutProps) {
  const bestScore = useScoreStore((s) => s.getBestScore(test.id));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回首页</span>
          </Link>

          <div className="flex items-center gap-2 glass-card px-4 py-2">
            <Trophy className="w-4 h-4" style={{ color: test.color }} />
            <span className="text-sm text-white/50">最佳:</span>
            <span className="font-mono font-bold text-sm" style={{ color: test.color }}>
              {bestScore !== null ? `${bestScore} ${test.unit}` : `— ${test.unit}`}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: test.color, boxShadow: `0 0 10px ${test.color}` }}
              />
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{test.name}</h1>
            </div>
            <p className="text-white/50 text-lg">{test.description}</p>
          </div>

          <div className="animate-fade-in-scale">{children}</div>
        </div>
      </main>
    </div>
  );
}
