import { useState, useRef, useEffect, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'idle' | 'playing' | 'result';

interface Target {
  id: number;
  x: number;
  y: number;
}

const TARGET_COUNT = 30;

export default function AimTrainer() {
  const test = TESTS.find((t) => t.id === 'aim')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [clickTimes, setClickTimes] = useState<number[]>([]);
  const [missCount, setMissCount] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const lastClickRef = useRef(0);
  const updateScore = useScoreStore((s) => s.updateScore);

  const generateTargets = useCallback(() => {
    const rect = areaRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 600;
    const h = rect?.height ?? 400;
    const padding = 50;
    const size = 60;

    const result: Target[] = [];
    for (let i = 0; i < TARGET_COUNT; i++) {
      result.push({
        id: i,
        x: padding + Math.random() * (w - padding * 2 - size),
        y: padding + Math.random() * (h - padding * 2 - size),
      });
    }
    return result;
  }, []);

  const startTest = useCallback(() => {
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
        updateScore('aim', avg);
        setStartTime(now - startTimeRef.current);
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

  return (
    <TestLayout test={test}>
      <div className="glass-card overflow-hidden">
        {phase === 'idle' && (
          <div className="p-8 md:p-12 text-center">
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              点击 {TARGET_COUNT} 个目标，越快越好。
              <br />
              点击空白区域会被计为失误。
            </p>
            <button onClick={startTest} className="btn-primary">
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
                  className="absolute w-[60px] h-[60px] rounded-full bg-neon-green border-4 border-neon-green/50 animate-pop-in hover:scale-110 transition-transform cursor-pointer"
                  style={{
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
