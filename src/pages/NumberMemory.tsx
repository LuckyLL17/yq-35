import { useState, useEffect, useRef, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'idle' | 'showing' | 'input' | 'result';

function generateNumber(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export default function NumberMemory() {
  const test = TESTS.find((t) => t.id === 'number-memory')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState(3);
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [showTime, setShowTime] = useState(0);
  const [finalLevel, setFinalLevel] = useState(0);
  const [shaking, setShaking] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);
  const inputRef = useRef<HTMLInputElement>(null);

  const getShowDuration = (lvl: number) => 1000 + lvl * 400;

  const startTest = useCallback((lvl: number) => {
    const num = generateNumber(lvl);
    setNumber(num);
    setShowTime(getShowDuration(lvl));
    setPhase('showing');
    setInput('');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, getShowDuration(lvl) - elapsed);
      setShowTime(remaining);
      if (remaining <= 0 && timerRef.current) clearInterval(timerRef.current);
    }, 50);

    timeoutRef.current = window.setTimeout(() => {
      setPhase('input');
      setTimeout(() => inputRef.current?.focus(), 100);
    }, getShowDuration(lvl));
  }, []);

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
        const finalLvl = Math.max(0, level - 1);
        setFinalLevel(finalLvl);
        updateScore('number-memory', finalLvl);
        setPhase('result');
      }
    },
    [input, number, level, startTest, updateScore],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRestart = () => {
    setLevel(3);
    setPhase('idle');
  };

  return (
    <TestLayout test={test}>
      <div className={`glass-card p-8 md:p-12 ${shaking ? 'animate-shake' : ''}`}>
        {phase === 'idle' && (
          <div className="text-center">
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
        )}

        {phase === 'showing' && (
          <div className="text-center py-8">
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
        )}

        {phase === 'input' && (
          <form onSubmit={handleSubmit} className="text-center max-w-md mx-auto">
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
        )}

        {phase === 'result' && (
          <ResultDisplay
            test={test}
            score={finalLevel}
            onRetry={handleRestart}
            stats={[
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
