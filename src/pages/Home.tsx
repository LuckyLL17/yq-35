import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import TestCard from '@/components/TestCard';
import { TESTS } from '@/types';
import { useTrainingStore } from '@/store/useTrainingStore';
import { Calendar, Play, CheckCircle, ListChecks } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const dailyTraining = useTrainingStore((s) => s.getDailyTraining());
  const startSessionFromPlan = useTrainingStore((s) => s.startSessionFromPlan);

  const handleStartDaily = () => {
    startSessionFromPlan(dailyTraining.plan);
    navigate('/training/session');
  };

  const totalRounds = dailyTraining.plan.items.reduce((sum, item) => sum + item.rounds, 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 md:py-12">
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Calendar className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-display text-xl font-bold">今日训练</h2>
          </div>
          <Link
            to="/training"
            className="glass-card-hover group relative overflow-hidden p-6 block"
            style={{
              background: `linear-gradient(135deg, ${dailyTraining.plan.color}10 0%, transparent 50%)`,
            }}
          >
            <div
              className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
              style={{ backgroundColor: dailyTraining.plan.color }}
            />

            <div className="relative flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${dailyTraining.plan.color}20`,
                  border: `1px solid ${dailyTraining.plan.color}40`,
                  boxShadow: `0 0 30px ${dailyTraining.plan.color}20`,
                }}
              >
                {dailyTraining.completed ? (
                  <CheckCircle className="w-8 h-8 text-neon-green" />
                ) : (
                  <Calendar className="w-8 h-8" style={{ color: dailyTraining.plan.color }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-xl">{dailyTraining.plan.name}</h3>
                  {dailyTraining.completed && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green">
                      已完成
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50 mb-3">{dailyTraining.plan.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/40 flex items-center gap-1">
                    <ListChecks className="w-4 h-4" />
                    {dailyTraining.plan.items.length} 项测试
                  </span>
                  <span className="text-white/40">共 {totalRounds} 轮</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dailyTraining.completed) {
                    navigate('/training');
                  } else {
                    handleStartDaily();
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex-shrink-0"
                style={{
                  backgroundColor: `${dailyTraining.plan.color}20`,
                  color: dailyTraining.plan.color,
                  border: `1px solid ${dailyTraining.plan.color}40`,
                }}
              >
                <Play className="w-4 h-4 fill-current" />
                {dailyTraining.completed ? '查看详情' : '开始训练'}
              </button>
            </div>
          </Link>
        </section>

        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-display text-xl font-bold">全部测试</h2>
          <Link
            to="/training"
            className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            训练套餐 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTS.map((test, index) => (
            <TestCard key={test.id} test={test} index={index} />
          ))}
        </div>

        <footer className="mt-16 pb-8 text-center text-white/30 text-sm">
          <p>挑战自己的极限 · Human Benchmark</p>
        </footer>
      </main>
    </div>
  );
}
