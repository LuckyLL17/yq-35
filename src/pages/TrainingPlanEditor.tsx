import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Save,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Zap,
  Brain,
  Keyboard,
  Target,
  Rabbit,
  Palette,
  Repeat,
  Filter,
  Calculator,
} from 'lucide-react';
import Header from '@/components/Header';
import { useTrainingStore } from '@/store/useTrainingStore';
import { TESTS } from '@/types';
import type { TestId, TrainingPlanItem } from '@/types';

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

const colorOptions = [
  '#00d4ff',
  '#a855f7',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#f97316',
  '#ef4444',
];

export default function TrainingPlanEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;

  const getPlan = useTrainingStore((s) => s.getPlan);
  const createPlan = useTrainingStore((s) => s.createPlan);
  const updatePlan = useTrainingStore((s) => s.updatePlan);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<TrainingPlanItem[]>([]);
  const [color, setColor] = useState('#00d4ff');

  useEffect(() => {
    if (isEditing && id) {
      const plan = getPlan(id);
      if (plan) {
        setName(plan.name);
        setDescription(plan.description);
        setItems(plan.items);
        setColor(plan.color);
      }
    }
  }, [isEditing, id, getPlan]);

  const addTest = (testId: TestId) => {
    if (items.some((item) => item.testId === testId)) return;
    setItems([...items, { testId, rounds: 2 }]);
  };

  const removeTest = (testId: TestId) => {
    setItems(items.filter((item) => item.testId !== testId));
  };

  const updateRounds = (testId: TestId, rounds: number) => {
    setItems(
      items.map((item) =>
        item.testId === testId ? { ...item, rounds: Math.max(1, Math.min(10, rounds)) } : item,
      ),
    );
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('请输入训练套餐名称');
      return;
    }
    if (items.length === 0) {
      alert('请至少添加一个测试项目');
      return;
    }

    if (isEditing && id) {
      updatePlan(id, { name: name.trim(), description: description.trim(), items, color });
    } else {
      createPlan(name.trim(), description.trim(), items, color, 'target');
    }
    navigate('/training');
  };

  const availableTests = TESTS.filter((test) => !items.some((item) => item.testId === test.id));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 md:py-12 max-w-4xl">
        <button
          onClick={() => navigate('/training')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回训练套餐
        </button>

        <div className="mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {isEditing ? '编辑训练套餐' : '创建训练套餐'}
          </h2>
          <p className="text-white/50">自由组合多个测试，设置训练次数，打造专属训练套餐</p>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="font-display font-bold text-lg mb-4">基本信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">套餐名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入套餐名称"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">套餐描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简单描述一下这个训练套餐"
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">主题颜色</label>
              <div className="flex gap-3">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="font-display font-bold text-lg mb-4">训练项目</h3>
          <p className="text-sm text-white/50 mb-4">
            已添加 {items.length} 项测试，共 {items.reduce((sum, item) => sum + item.rounds, 0)} 轮
          </p>

          {items.length > 0 && (
            <div className="space-y-3 mb-6">
              {items.map((item, index) => {
                const test = TESTS.find((t) => t.id === item.testId);
                const Icon = iconMap[item.testId] ?? Zap;
                return (
                  <div
                    key={item.testId}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex flex-col gap-1">
                      <GripVertical className="w-4 h-4 text-white/20" />
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${test?.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: test?.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{test?.name}</div>
                      <div className="text-xs text-white/40">{test?.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateRounds(item.testId, item.rounds - 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-mono font-bold text-lg">
                        {item.rounds}
                      </span>
                      <button
                        onClick={() => updateRounds(item.testId, item.rounds + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === items.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeTest(item.testId)}
                      className="p-2 text-white/40 hover:text-neon-red transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <h4 className="text-sm text-white/60 mb-3">添加测试</h4>
            {availableTests.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTests.map((test) => {
                  const Icon = iconMap[test.id] ?? Zap;
                  return (
                    <button
                      key={test.id}
                      onClick={() => addTest(test.id)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all text-left group"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${test.color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: test.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{test.name}</div>
                      </div>
                      <Plus className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-white/30 text-center py-4">所有测试都已添加</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/training')}
            className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30 transition-all font-medium"
          >
            <Save className="w-4 h-4" />
            保存套餐
          </button>
        </div>
      </main>
    </div>
  );
}
