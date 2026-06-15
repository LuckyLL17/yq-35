import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Zap,
  Brain,
  Sparkles,
  Flame,
  Target,
  Plus,
  Play,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  ListChecks,
} from 'lucide-react';
import Header from '@/components/Header';
import { useTrainingStore } from '@/store/useTrainingStore';
import { TRAINING_TEMPLATES, TESTS } from '@/types';
import type { TrainingPlan, TrainingPlanTemplate } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  zap: Zap,
  brain: Brain,
  sparkles: Sparkles,
  flame: Flame,
  target: Target,
};

function PlanCard({
  plan,
  type = 'custom',
  onStart,
  onEdit,
  onDelete,
  onDuplicate,
  isCompleted = false,
}: {
  plan: TrainingPlan | TrainingPlanTemplate;
  type?: 'daily' | 'template' | 'custom';
  onStart: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  isCompleted?: boolean;
}) {
  const Icon = iconMap[plan.icon] ?? Target;
  const totalRounds = plan.items.reduce((sum, item) => sum + item.rounds, 0);

  return (
    <div className="glass-card-hover group relative overflow-hidden p-6 flex flex-col gap-4">
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500"
        style={{ backgroundColor: plan.color }}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300"
          style={{ boxShadow: `0 0 0 1px ${plan.color}20` }}
        >
          <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" style={{ color: plan.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg">{plan.name}</h3>
            {isCompleted && <CheckCircle className="w-5 h-5 text-neon-green" />}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-white/40 flex items-center gap-1">
              <ListChecks className="w-3 h-3" />
              {plan.items.length} 项测试
            </span>
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              共 {totalRounds} 轮
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-white/50 leading-relaxed">{plan.description}</p>

      <div className="relative mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {plan.items.slice(0, 4).map((item, i) => {
            const test = TESTS.find((t) => t.id === item.testId);
            return (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10"
                style={{ borderColor: `${test?.color}30` }}
              >
                {test?.name} × {item.rounds}
              </span>
            );
          })}
          {plan.items.length > 4 && (
            <span className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10">
              +{plan.items.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: `${plan.color}20`,
              color: plan.color,
              border: `1px solid ${plan.color}40`,
            }}
          >
            <Play className="w-4 h-4" />
            开始训练
          </button>
          {type === 'custom' && (
            <>
              <button
                onClick={onEdit}
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                title="编辑"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onDuplicate}
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                title="复制"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-neon-red hover:border-neon-red/40 transition-all"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          {type === 'template' && (
            <button
              onClick={onDuplicate}
              className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
              title="使用此模板创建"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrainingPlans() {
  const navigate = useNavigate();
  const dailyTraining = useTrainingStore((s) => s.getDailyTraining());
  const plans = useTrainingStore((s) => s.plans);
  const createFromTemplate = useTrainingStore((s) => s.createFromTemplate);
  const deletePlan = useTrainingStore((s) => s.deletePlan);
  const duplicatePlan = useTrainingStore((s) => s.duplicatePlan);
  const startSession = useTrainingStore((s) => s.startSession);
  const startSessionFromPlan = useTrainingStore((s) => s.startSessionFromPlan);

  const handleStartDaily = () => {
    startSessionFromPlan(dailyTraining.plan);
    navigate('/training/session');
  };

  const handleStartPlan = (planId: string) => {
    startSession(planId);
    navigate('/training/session');
  };

  const handleStartTemplate = (templateId: string) => {
    const plan = createFromTemplate(templateId as any);
    startSession(plan.id);
    navigate('/training/session');
  };

  const handleUseTemplate = (templateId: string) => {
    createFromTemplate(templateId as any);
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/training/edit/${planId}`);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('确定要删除这个训练套餐吗？')) {
      deletePlan(planId);
    }
  };

  const handleDuplicatePlan = (planId: string) => {
    duplicatePlan(planId);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">训练套餐</h2>
          <p className="text-white/50">选择或创建训练套餐，系统会按顺序引导你完成全部训练</p>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <Calendar className="w-5 h-5 text-neon-cyan" />
            <h3 className="font-display text-xl font-bold">今日训练</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <PlanCard
              plan={dailyTraining.plan}
              type="daily"
              onStart={handleStartDaily}
              isCompleted={dailyTraining.completed}
            />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-neon-purple" />
            <h3 className="font-display text-xl font-bold">推荐套餐</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRAINING_TEMPLATES.map((template, index) => (
              <div key={template.id} style={{ animationDelay: `${index * 50}ms` }}>
                <PlanCard
                  plan={template}
                  type="template"
                  onStart={() => handleStartTemplate(template.id)}
                  onDuplicate={() => handleUseTemplate(template.id)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-neon-green" />
              <h3 className="font-display text-xl font-bold">我的套餐</h3>
            </div>
            <button
              onClick={() => navigate('/training/new')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              创建套餐
            </button>
          </div>
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  type="custom"
                  onStart={() => handleStartPlan(plan.id)}
                  onEdit={() => handleEditPlan(plan.id)}
                  onDelete={() => handleDeletePlan(plan.id)}
                  onDuplicate={() => handleDuplicatePlan(plan.id)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 mb-4">还没有自定义训练套餐</p>
              <button
                onClick={() => navigate('/training/new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                创建第一个套餐
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
