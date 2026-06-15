import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { TESTS, DifficultyLevel, AIM_DIFFICULTY } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'select-difficulty' | 'idle' | 'playing' | 'result';

interface Target {
  id: number;
  x: number;
  y: number;
}

export default function AimTrainer() {
  const test = TESTS.find((t) => t.id === 'aim')!;
  const [phase, setPhase] = useState<Phase>('select-difficulty');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [clickTimes, setClickTimes] = useState<number[]>([]);
  const [missCount, setMissCount] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const lastClickRef = useRef(0);
  const updateScore = useScoreStore((s) => s.updateScore);
  const animRef = useRef<number>(0);
  const currentIndexRef = useRef(0);
  const [searchParams] = useSearchParams();
  const isTrainingMode = searchParams.get('training') === '1';

  const config = difficulty ? AIM_DIFFICULTY[difficulty] : AIM_DIFFICULTY.normal;

  const generateTargets = useCallback(() => {
    const rect = areaRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 600;
    const h = rect?.height ?? 400;
    const padding = 50;
    const size = config.targetSize;

    const result: Target[] = [];
    for (let i = 0; i < config.targetCount; i++) {
      result.push({
        id: i,
        x: padding + Math.random() * (w - padding * 2 - size),
        y: padding + Math.random() * (h - padding * 2 - size),
      });
    }
    return result;
  }, [config.targetCount, config.targetSize]);

  useEffect(() => {
    if (isTrainingMode && phase === 'select-difficulty') {
      setDifficulty('normal');
      setPhase('idle');
    }
  }, [isTrainingMode, phase]);

  const startTest = useCallback(() => {
    if (isTrainingMode) {
      setPhase('idle');
    } else {
      setPhase('select-difficulty');
    }
  }, [isTrainingMode]);

  const beginPlaying = useCallback(() => {
    const ts = generateTargets();
    setTargets(ts);
    setCurrentIndex(0);
    setClickTimes([]);
    setMissCount(0);
    setStartTime(0);
    setPhase('playing');
    startTimeRef.current = performance.now();
    lastClickRef.current = performance.now();
  }, [generateTargets]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (phase !== 'playing' || !config.movingTargets) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    let lastMove = performance.now();
    const moveTarget = (now: number) => {
      if (now - lastMove >= 100) {
        lastMove = now;
        const ci = currentIndexRef.current;
        setTargets((prev) => {
          if (ci >= prev.length) return prev;
          const rect = areaRef.current?.getBoundingClientRect();
          const w = rect?.width ?? 600;
          const h = rect?.height ?? 400;
          const padding = 50;
          const size = config.targetSize;
          const delta = 8;
          const t = prev[ci];
          if (!t) return prev;
          const angle = Math.random() * Math.PI * 2;
          const nx = Math.min(Math.max(padding, t.x + Math.cos(angle) * delta), w - padding - size);
          const ny = Math.min(Math.max(padding, t.y + Math.sin(angle) * delta), h - padding - size);
          const next = [...prev];
          next[ci] = { ...t, x: nx, y: ny };
          return next;
        });
      }
      animRef.current = requestAnimationFrame(moveTarget);
    };

    animRef.current = requestAnimationFrame(moveTarget);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, config.movingTargets, config.targetSize]);

  const handleTargetClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const now = performance.now();
      const reaction = now - lastClickRef.current;
      lastClickRef.current = now;

      const newTimes = [...clickTimes, reaction];
      setClickTimes(newTimes);

      if (currentIndex + 1 >= targets.length) {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        const duration = Math.round(now - startTimeRef.current);
        updateScore('aim', avg, duration);
        setStartTime(duration);
        setPhase('result');
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    },
    [clickTimes, currentIndex, targets.length, updateScore],
  );

  const handleMiss = useCallback(() => {
    if (phase === 'playing') {
      setMissCount((c) => c + 1);
    }
  }, [phase]);

  useEffect(() => {
    if (!startTime) {
      // noop
    }
  }, [startTime]);

  const avgTime =
    clickTimes.length > 0
      ? Math.round(clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length)
      : 0;

  const difficultyLabel =
    difficulty === 'easy' ? '简单' : difficulty === 'normal' ? '普通' : difficulty === 'hard' ? '困难' : '';

  return (
    <TestLayout test={test}>
      <div className="glass-card overflow-hidden">
        {phase === 'select-difficulty' && (
          <div className="p-8 md:p-12 text-center">
            <DifficultySelector
              selected={difficulty}
              onSelect={(level) => {
                setDifficulty(level);
              }}
              testColor={test.color}
            />
            <button
              onClick={beginPlaying}
              disabled={!difficulty}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              开始测试
            </button>
          </div>
        )}

        {phase === 'idle' && (
          <div className="p-8 md:p-12 text-center">
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              点击 {config.targetCount} 个目标，越快越好。
              <br />
              点击空白区域会被计为失误。
            </p>
            <button onClick={beginPlaying} className="btn-primary">
              开始测试
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-white/40">目标:</span>
                <span className="font-display text-2xl font-bold text-neon-green">
                  {currentIndex + 1}/{targets.length}
                </span>
              </div>
              {difficulty && (
                <span
                  className="text-xs font-display font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: test.color,
                    border: `1px solid ${test.color}40`,
                    backgroundColor: `${test.color}15`,
                  }}
                >
                  {difficultyLabel}
                </span>
              )}
              {missCount > 0 && <div className="text-neon-red text-sm">失误: {missCount}</div>}
              {clickTimes.length > 0 && (
                <div className="text-white/40 text-sm">平均: {Math.round(avgTime)}ms</div>
              )}
            </div>

            <div
              ref={areaRef}
              onClick={handleMiss}
              className="relative w-full h-[400px] md:h-[500px] cursor-crosshair select-none"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
              }}
            >
              {targets[currentIndex] && (
                <button
                  onClick={handleTargetClick}
                  className="absolute rounded-full bg-neon-green border-4 border-neon-green/50 animate-pop-in hover:scale-110 transition-transform cursor-pointer"
                  style={{
                    width: config.targetSize,
                    height: config.targetSize,
                    left: targets[currentIndex].x,
                    top: targets[currentIndex].y,
                    boxShadow:
                      '0 0 30px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                    {currentIndex + 1}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="p-6 md:p-8">
            <ResultDisplay
              test={test}
              score={Math.round(avgTime)}
              onRetry={startTest}
              stats={[
                { label: '难度', value: difficultyLabel },
                { label: '总用时', value: `${Math.round(startTime)}ms` },
                { label: '目标数', value: `${targets.length}` },
                { label: '失误次数', value: `${missCount}` },
                {
                  label: '准确率',
                  value: `${Math.round((targets.length / (targets.length + missCount)) * 100)}%`,
                },
              ]}
            />
          </div>
        )}
      </div>
    </TestLayout>
  );
}
