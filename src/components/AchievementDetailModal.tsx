import { useEffect } from 'react';
import { X, Clock, Award, Lock, ArrowRight, Sparkles } from 'lucide-react';
import type { Achievement } from '@/types';
import { RARITY_INFO } from '@/data/achievements';
import { TESTS } from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  unlocked: boolean;
  unlockedAt?: number;
  progressLabel?: string;
  onClose: () => void;
}

function formatDateTimeFull(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function AchievementDetailModal({
  achievement,
  unlocked,
  unlockedAt,
  progressLabel,
  onClose,
}: AchievementDetailModalProps) {
  useEffect(() => {
    if (!achievement) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [achievement, onClose]);

  if (!achievement) return null;

  const rarity = RARITY_INFO[achievement.rarity];
  const relatedTestMeta = achievement.relatedTest && achievement.relatedTest !== 'all'
    ? TESTS.find((t) => t.id === achievement.relatedTest)
    : undefined;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full max-w-md rounded-3xl border-2 bg-gradient-to-br overflow-hidden animate-fade-in-scale',
          rarity.bg,
          rarity.border,
          rarity.glow,
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="relative p-7">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${achievement.color}22`, color: achievement.color, border: `1px solid ${achievement.color}55` }}
              >
                <Award className="w-3 h-3" />
                {rarity.label}
              </span>
            </div>

            <div
              className={cn(
                'relative w-32 h-32 rounded-3xl flex items-center justify-center my-5 border-2',
                unlocked ? 'animate-float' : '',
              )}
              style={
                unlocked
                  ? {
                      backgroundColor: `${achievement.color}22`,
                      borderColor: `${achievement.color}aa`,
                      boxShadow: `0 0 60px ${achievement.color}66, inset 0 0 40px ${achievement.color}33`,
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.12)',
                    }
              }
            >
              {unlocked && (
                <div
                  className="absolute inset-0 rounded-3xl animate-pulse"
                  style={{
                    boxShadow: `inset 0 0 50px ${achievement.color}33`,
                  }}
                />
              )}
              <span
                className={cn('text-6xl relative z-10', !unlocked && 'opacity-40 grayscale')}
                style={unlocked ? { filter: `drop-shadow(0 0 20px ${achievement.color})` } : undefined}
              >
                {unlocked ? achievement.icon : '🔒'}
              </span>
            </div>

            <h2
              className="font-display font-black text-3xl mb-2"
              style={unlocked ? { color: achievement.color, textShadow: `0 0 30px ${achievement.color}88` } : { color: 'rgba(255,255,255,0.6)' }}
            >
              {achievement.name}
            </h2>

            <p className={cn('text-sm leading-relaxed max-w-xs mb-5', unlocked ? 'text-white/75' : 'text-white/40')}>
              {achievement.description}
            </p>

            {unlocked && unlockedAt ? (
              <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                    解锁状态
                  </span>
                  <span className="text-xs font-semibold text-neon-green">
                    已解锁
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    解锁时间
                  </span>
                  <span className="text-xs font-mono text-white/70">
                    {formatDateTimeFull(unlockedAt)}
                  </span>
                </div>
                {progressLabel && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">完成进度</span>
                    <span className="text-xs font-semibold text-neon-cyan">{progressLabel}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-white/50" />
                    解锁状态
                  </span>
                  <span className="text-xs font-semibold text-white/50">
                    未解锁
                  </span>
                </div>
                {relatedTestMeta && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">关联测试</span>
                    <span className="text-xs font-semibold" style={{ color: relatedTestMeta.color }}>
                      {relatedTestMeta.name}
                    </span>
                  </div>
                )}
                {progressLabel && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">当前进度</span>
                    <span className="text-xs font-semibold text-white/70">{progressLabel}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 w-full flex gap-2.5">
              {relatedTestMeta && !unlocked && (
                <Link
                  to={relatedTestMeta.route}
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    backgroundColor: `${relatedTestMeta.color}22`,
                    border: `1px solid ${relatedTestMeta.color}66`,
                    color: relatedTestMeta.color,
                  }}
                >
                  去{relatedTestMeta.name}挑战
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={onClose}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
                  unlocked
                    ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30'
                    : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/15',
                )}
              >
                {unlocked ? '太棒了' : '知道了'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
