import { Gauge, RotateCcw, User } from 'lucide-react';
import { useScoreStore } from '@/store/useScoreStore';
import { Link } from 'react-router-dom';

export default function Header() {
  const totalAttempts = Object.values(useScoreStore.getState().records).reduce(
    (sum, r) => sum + (r?.attempts ?? 0),
    0,
  );
  const totalTests = Object.keys(useScoreStore.getState().records).length;
  const resetAll = useScoreStore((s) => s.resetAll);

  return (
    <header className="relative border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="container relative py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight">
                  <span className="text-gradient">Human Benchmark</span>
                </h1>
                <p className="text-xs text-white/40">人类反应测试平台</p>
              </div>
            </Link>
            <p className="text-white/50 max-w-lg text-sm md:text-base leading-relaxed">
              测试你的反应速度、记忆力、手眼协调等多项能力，挑战自己的极限！
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-card px-5 py-3">
              <div className="text-xs text-white/40">已完成测试</div>
              <div className="font-display font-bold text-2xl text-neon-cyan">
                {totalTests}<span className="text-sm text-white/40 ml-1">/9</span>
              </div>
            </div>
            <div className="glass-card px-5 py-3">
              <div className="text-xs text-white/40">总尝试次数</div>
              <div className="font-display font-bold text-2xl text-neon-purple">{totalAttempts}</div>
            </div>
            <Link
              to="/profile"
              className="glass-card px-4 py-3 text-white/60 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
              title="用户档案"
            >
              <User className="w-5 h-5" />
            </Link>
            {totalAttempts > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定要清除所有成绩记录吗？')) resetAll();
                }}
                className="glass-card px-4 py-3 text-white/40 hover:text-neon-red hover:border-neon-red/40 transition-colors"
                title="清除所有记录"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
