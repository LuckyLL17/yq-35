import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ACHIEVEMENTS, RARITY_INFO } from '@/data/achievements';
import type { Achievement } from '@/types';
import { cn } from '@/lib/utils';

interface AchievementCelebrationProps {
  achievementIds: string[];
  onClose: () => void;
}

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
}

const CONFETTI_COLORS = ['#00d4ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#ffffff'];

function generateConfetti(count: number): Confetti[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));
}

export default function AchievementCelebration({ achievementIds, onClose }: AchievementCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const [confetti] = useState(() => generateConfetti(60));

  const achievements: Achievement[] = achievementIds
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter((a): a is Achievement => !!a);

  const current = achievements[currentIndex];

  useEffect(() => {
    if (!current) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('show'), 350));
    timers.push(
      setTimeout(() => {
        setPhase('exit');
      }, 2400),
    );
    timers.push(
      setTimeout(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex((i) => i + 1);
          setPhase('enter');
        } else {
          onClose();
        }
      }, 2900),
    );

    return () => timers.forEach(clearTimeout);
  }, [currentIndex, achievements.length, current, onClose]);

  if (!current) return null;

  const rarity = RARITY_INFO[current.rarity];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <style>{`
        @keyframes ach-fall {
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes ach-badge-pop {
          0% { transform: scale(0) rotate(-30deg); opacity: 0; }
          50% { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ach-shine {
          0% { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        @keyframes ach-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ach-float-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" style={{ pointerEvents: 'auto' }}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute rounded-sm pointer-events-none"
          style={{
            left: `${c.left}%`,
            top: 0,
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            animation: `ach-fall ${c.duration}s ${c.delay}s ease-in forwards`,
            transform: `rotate(${c.rotate}deg)`,
          }}
        />
      ))}

      <div
        className="relative z-10"
        style={{
          opacity: phase === 'show' ? 1 : phase === 'enter' ? 0 : 0,
          transform: phase === 'show' ? 'translateY(0) scale(1)' : phase === 'enter' ? 'translateY(40px) scale(0.85)' : 'translateY(-40px) scale(0.9)',
          transition: 'all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className={cn(
            'relative p-8 rounded-3xl border-2 bg-gradient-to-br overflow-hidden',
            rarity.bg,
            rarity.border,
            rarity.glow,
          )}
          style={{ minWidth: 340, maxWidth: 420 }}
        >
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ animation: phase === 'show' ? 'ach-shine 1.8s 0.3s ease-out' : 'none' }}
          >
            <div className="absolute top-0 left-0 w-1/3 h-full bg-white/15" />
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.4 }}
          >
            <div
              className="w-60 h-60 rounded-full border-4"
              style={{
                borderColor: current.color,
                animation: phase === 'show' ? 'ach-ring 1.4s 0.2s ease-out forwards' : 'none',
              }}
            />
            <div
              className="absolute w-60 h-60 rounded-full border-4"
              style={{
                borderColor: current.color,
                animation: phase === 'show' ? 'ach-ring 1.4s 0.45s ease-out forwards' : 'none',
              }}
            />
            <div
              className="absolute w-60 h-60 rounded-full border-4"
              style={{
                borderColor: current.color,
                animation: phase === 'show' ? 'ach-ring 1.4s 0.7s ease-out forwards' : 'none',
              }}
            />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: current.color }}>
              🏅 {rarity.label}成就解锁
            </div>

            <div
              className="w-28 h-28 rounded-full flex items-center justify-center mb-5 border-4"
              style={{
                backgroundColor: `${current.color}22`,
                borderColor: `${current.color}aa`,
                boxShadow: `0 0 40px ${current.color}66, inset 0 0 30px ${current.color}33`,
                animation: phase === 'show' ? 'ach-badge-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, ach-float-up 2.5s 0.6s ease-in-out infinite' : 'none',
              }}
            >
              <span className="text-6xl drop-shadow-lg" style={{ filter: `drop-shadow(0 0 12px ${current.color})` }}>
                {current.icon}
              </span>
            </div>

            <h3
              className="font-display font-black text-2xl mb-2"
              style={{
                color: current.color,
                textShadow: `0 0 20px ${current.color}66`,
              }}
            >
              {current.name}
            </h3>

            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              {current.description}
            </p>

            <div className="mt-5 text-[11px] text-white/40 tracking-wider">
              {currentIndex + 1} / {achievements.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
