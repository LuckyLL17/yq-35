import { Shield, Swords, Flame } from 'lucide-react';
import { DIFFICULTY_OPTIONS, type DifficultyLevel } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: Shield,
  swords: Swords,
  flame: Flame,
};

interface DifficultySelectorProps {
  selected: DifficultyLevel | null;
  onSelect: (level: DifficultyLevel) => void;
  testColor: string;
}

export default function DifficultySelector({ selected, onSelect, testColor }: DifficultySelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Swords className="w-5 h-5" style={{ color: testColor }} />
        <h3 className="font-display font-bold text-lg">选择难度</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {DIFFICULTY_OPTIONS.map((opt) => {
          const Icon = iconMap[opt.icon];
          const isSelected = selected === opt.level;
          return (
            <button
              key={opt.level}
              onClick={() => onSelect(opt.level)}
              className="glass-card-hover p-4 flex flex-col items-center gap-2 transition-all duration-300"
              style={{
                borderColor: isSelected ? `${opt.color}60` : undefined,
                background: isSelected
                  ? `linear-gradient(135deg, ${opt.color}15 0%, transparent 50%)`
                  : undefined,
                boxShadow: isSelected ? `0 0 20px ${opt.color}20` : undefined,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${opt.color}20`,
                  border: `1px solid ${opt.color}40`,
                }}
              >
                {Icon && <Icon className="w-5 h-5" style={{ color: opt.color }} />}
              </div>
              <span
                className="font-display font-bold text-sm"
                style={{ color: isSelected ? opt.color : undefined }}
              >
                {opt.name}
              </span>
              <span className="text-[11px] text-white/40 text-center leading-tight">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
