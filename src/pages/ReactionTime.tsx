import { useState, useRef, useEffect, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'idle' | 'waiting' | 'ready' | 'too-early' | 'result';

export default function ReactionTime() {
  const test = TESTS.find((t) => t.id === 'reaction')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [reactionTime, setReactionTime] = useState(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startTimeRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);

  const startWait = useCallback(() => {
    setPhase('waiting');
    const delay = 1000 + Math.random() * 4000;
    timeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase('ready');
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      startWait();
    } else if (phase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase('too-early');
    } else if (phase === 'ready') {
      const time = Math.round(performance.now() - startTimeRef.current);
      const newAttempts = [...attempts, time];
      setAttempts(newAttempts);
      setReactionTime(time);

      if (newAttempts.length >= 5) {
        const avg = Math.round(newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length);
        updateScore('reaction', avg);
      }
      setPhase('result');
    } else if (phase === 'too-early') {
      startWait();
    } else if (phase === 'result') {
      if (attempts.length >= 5) {
        setAttempts([]);
      }
      startWait();
    }
  }, [phase, attempts, startWait, updateScore]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getBgClass = () => {
    switch (phase) {
      case 'waiting':
        return 'bg-neon-red';
      case 'ready':
        return 'bg-neon-green';
      case 'too-early':
        return 'bg-neon-yellow';
      default:
        return 'bg-neon-cyan';
    }
  };

  const getText = () => {
    switch (phase) {
      case 'idle':
        return { title: '反应时间测试', subtitle: '点击开始' };
      case 'waiting':
        return { title: '等待绿色...', subtitle: '变绿后立即点击' };
      case 'ready':
        return { title: '点击！', subtitle: '' };
      case 'too-early':
        return { title: '太早了！', subtitle: '点击重试' };
      case 'result':
        return {
          title: `${reactionTime} ms`,
          subtitle: attempts.length < 5 ? `点击继续 (${attempts.length}/5)` : `平均: ${Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)} ms · 点击再试`,
        };
    }
  };

  const avgScore =
    attempts.length >= 5
      ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
      : reactionTime;

  const text = getText();

  return (
    <TestLayout test={test}>
      <div
        onClick={handleClick}
        className={`glass-card min-h-[500px] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 border-2 ${getBgClass()}/10 hover:${getBgClass()}/20`}
        style={{
          borderColor: phase === 'waiting' ? 'rgba(239, 68, 68, 0.3)' : phase === 'ready' ? 'rgba(16, 185, 129, 0.5)' : undefined,
        }}
      >
        <h2
          className={`font-display font-black text-5xl md:text-7xl mb-4 transition-colors ${
            phase === 'ready' ? 'text-neon-green' : phase === 'waiting' ? 'text-neon-red' : phase === 'too-early' ? 'text-neon-yellow' : ''
          }`}
          style={
            phase === 'ready'
              ? { textShadow: '0 0 40px rgba(16, 185, 129, 0.6)' }
              : phase === 'waiting'
                ? { textShadow: '0 0 40px rgba(239, 68, 68, 0.6)' }
                : undefined
          }
        >
          {text.title}
        </h2>
        <p className="text-white/50 text-lg">{text.subtitle}</p>

        {attempts.length > 0 && phase === 'result' && (
          <div className="mt-8 flex gap-2 flex-wrap justify-center max-w-md">
            {attempts.map((t, i) => (
              <span
                key={i}
                className="font-mono text-sm px-3 py-1 rounded-lg bg-white/5 border border-white/10"
              >
                {t}ms
              </span>
            ))}
          </div>
        )}
      </div>

      {phase === 'result' && attempts.length >= 5 && (
        <div className="mt-6">
          <ResultDisplay
            test={test}
            score={avgScore}
            onRetry={() => {
              setAttempts([]);
              setPhase('idle');
            }}
            stats={attempts.map((t, i) => ({ label: `第${i + 1}次`, value: `${t}ms` }))}
          />
        </div>
      )}
    </TestLayout>
  );
}
