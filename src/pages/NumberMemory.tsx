import { useState, useRef, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { generateNumber, calculateShowDuration, calculateFinalLevel } from '@/algorithms/numberMemory';
import { TESTS, NUMBER_MEMORY_DIFFICULTY, DIFFICULTY_OPTIONS, type NumberMemoryDifficultyConfig } from '@/types';
import { useTestFlow } from '@/hooks/useTestFlow';

type Phase = 'select-difficulty' | 'idle' | 'showing' | 'input' | 'result';

export default function NumberMemory() {
  const test = TESTS.find((t) => t.id === 'number-memory')!;
  const [level, setLevel] = useState(3);
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [showTime, setShowTime] = useState(0);
  const [finalLevel, setFinalLevel] = useState(0);
  const [shaking, setShaking] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    phase,
    setPhase,
    difficulty,
    config,
    isTrainingMode,
    testStartRef,
    startTimer,
    elapsed,
    finishTest,
    restart,
    selectDifficulty,
  } = useTestFlow<Phase, NumberMemoryDifficultyConfig>({
    testId: 'number-memory',
    difficultyConfig: NUMBER_MEMORY_DIFFICULTY,
    onReset: () => {
      if (isTrainingMode) {
        const cfg = NUMBER_MEMORY_DIFFICULTY[difficulty ?? 'normal'];
        setLevel(cfg.startLevel);
      } else {
        setLevel(3);
      }
      setNumber('');
      setInput('');
      setShaking(false);
      setFinalLevel(0);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
  });

  const getShowDuration = useCallback((lvl: number) => calculateShowDuration(lvl, config.showDurationBase, config.showDurationPerDigit), [config.showDurationBase, config.showDurationPerDigit]);

  const startTest = useCallback((lvl: number) => {
    if (testStartRef.current === 0) {
      startTimer();
    }
    const num = generateNumber(lvl);
    setNumber(num);
    setShowTime(getShowDuration(lvl));
    setPhase('showing');
    setInput('');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const start = Date.now();
    const duration = getShowDuration(lvl);
    const progressInterval = window.setInterval(() => {
      const elapsedMs = Date.now() - start;
      const remaining = Math.max(0, duration - elapsedMs);
      setShowTime(remaining);
      if (remaining <= 0) clearInterval(progressInterval);
    }, 50);

    timeoutRef.current = window.setTimeout(() => {
      clearInterval(progressInterval);
      setPhase('input');
      setTimeout(() => inputRef.current?.focus(), 100);
    }, duration);
  }, [startTimer, setPhase, testStartRef, getShowDuration]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input === number) {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        startTest(nextLevel);
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 300);
        const finalLvl = calculateFinalLevel(level);
        setFinalLevel(finalLvl);
        const duration = elapsed();
        finishTest(finalLvl, duration);
      }
    },
    [input, number, level, startTest, elapsed, finishTest],
  );

  return (
    <TestLayout test={test}>
      <div className={`glass-card p-8 md:p-12 ${shaking ? 'animate-shake' : ''}`}>
        {phase === 'select-difficulty' && (
          <div className="text-center">
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              屏幕上会短暂显示一串数字，请在数字消失后输入你记忆中的数字。
              <br />
              每次答对会增加一位数字。
            </p>
            <DifficultySelector
              selected={difficulty}
              onSelect={(lvl) => {
                selectDifficulty(lvl);
                const cfg = NUMBER_MEMORY_DIFFICULTY[lvl];
                setLevel(cfg.startLevel);
              }}
              testColor={test.color}
            />
          </div>
        )}

        {phase === 'idle' && difficulty && (() => {
          const diffOpt = DIFFICULTY_OPTIONS.find((d) => d.level === difficulty)!;
          return (
            <div className="text-center">
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${diffOpt.color}20`,
                    border: `1px solid ${diffOpt.color}40`,
                    color: diffOpt.color,
                  }}
                >
                  {diffOpt.name}
                </span>
              </div>
              <div className="mb-6">
                <div className="font-display text-6xl md:text-8xl mb-4 text-neon-purple">{level}</div>
                <p className="text-white/50">起始位数</p>
              </div>
              <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
                屏幕上会短暂显示一串数字，请在数字消失后输入你记忆中的数字。
                <br />
                每次答对会增加一位数字。
              </p>
              <button onClick={() => startTest(level)} className="btn-primary">
                开始测试
              </button>
            </div>
          );
        })()}

        {phase === 'showing' && difficulty && (() => {
          const diffOpt = DIFFICULTY_OPTIONS.find((d) => d.level === difficulty)!;
          return (
            <div className="text-center py-8">
              <div className="mb-2">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${diffOpt.color}20`,
                    border: `1px solid ${diffOpt.color}40`,
                    color: diffOpt.color,
                  }}
                >
                  {diffOpt.name}
                </span>
              </div>
              <div className="mb-6">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-purple transition-all duration-50"
                    style={{ width: `${(showTime / getShowDuration(level)) * 100}%` }}
                  />
                </div>
              </div>
              <div
                className="font-display font-black tracking-widest text-neon-purple animate-fade-in"
                style={{
                  fontSize: level <= 6 ? 'clamp(3rem, 12vw, 8rem)' : 'clamp(2rem, 8vw, 5rem)',
                  textShadow: '0 0 40px rgba(168, 85, 247, 0.4)',
                }}
              >
                {number}
              </div>
              <p className="mt-4 text-white/40">记住这串数字...</p>
            </div>
          );
        })()}

        {phase === 'input' && difficulty && (() => {
          const diffOpt = DIFFICULTY_OPTIONS.find((d) => d.level === difficulty)!;
          return (
            <form onSubmit={handleSubmit} className="text-center max-w-md mx-auto">
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${diffOpt.color}20`,
                    border: `1px solid ${diffOpt.color}40`,
                    color: diffOpt.color,
                  }}
                >
                  {diffOpt.name}
                </span>
              </div>
              <p className="text-white/60 mb-6">第 {level} 位数字</p>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center font-mono text-4xl md:text-5xl font-bold bg-white/5 border border-white/20 focus:border-neon-purple/50 rounded-xl py-6 px-4 outline-none focus:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all"
                placeholder="输入数字..."
                autoFocus
              />
              <p className="mt-6 text-white/40 text-sm">
                你认为正确的数字是: {number.length} 位
              </p>
              <button type="submit" className="btn-primary mt-6" disabled={input.length === 0}>
                确认
              </button>
            </form>
          );
        })()}

        {phase === 'result' && (
          <ResultDisplay
            test={test}
            score={finalLevel}
            onRetry={restart}
            stats={[
              { label: '难度', value: difficulty ? DIFFICULTY_OPTIONS.find((d) => d.level === difficulty)?.name ?? '' : '' },
              { label: '显示数字', value: number },
              { label: '你的答案', value: input || '—' },
              { label: '当前关卡', value: `${level} 位` },
            ]}
          />
        )}
      </div>
    </TestLayout>
  );
}
