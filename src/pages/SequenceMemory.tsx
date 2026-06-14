import { useState, useEffect, useRef, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'idle' | 'showing' | 'playing' | 'result';

const COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'];

export default function SequenceMemory() {
  const test = TESTS.find((t) => t.id === 'sequence-memory')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);
  const updateScore = useScoreStore((s) => s.updateScore);

  const clearTimers = useCallback(() => {
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    timeoutRefs.current = [];
  }, []);

  const addRound = useCallback((seq: number[]) => {
    const next = [...seq, Math.floor(Math.random() * 4)];
    return next;
  }, []);

  const playSequence = useCallback((seq: number[]) => {
    setPhase('showing');
    clearTimers();

    seq.forEach((colorIdx, i) => {
      const onId = window.setTimeout(() => {
        setShowingIndex(colorIdx);
      }, i * 600 + 300);
      const offId = window.setTimeout(() => {
        setShowingIndex(null);
      }, i * 600 + 300 + 400);
      timeoutRefs.current.push(onId, offId);
    });

    const endId = window.setTimeout(() => {
      setPhase('playing');
      setPlayerIndex(0);
    }, seq.length * 600 + 500);
    timeoutRefs.current.push(endId);
  }, [clearTimers]);

  const startTest = useCallback(() => {
    clearTimers();
    const first = addRound([]);
    setSequence(first);
    setTimeout(() => playSequence(first), 300);
  }, [addRound, playSequence, clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleColorClick = useCallback(
    (colorIdx: number) => {
      if (phase !== 'playing') return;

      setActiveIndex(colorIdx);
      setTimeout(() => setActiveIndex(null), 200);

      if (sequence[playerIndex] === colorIdx) {
        const nextIdx = playerIndex + 1;

        if (nextIdx >= sequence.length) {
          updateScore('sequence-memory', sequence.length);
          const nextSeq = addRound(sequence);
          setSequence(nextSeq);
          setTimeout(() => playSequence(nextSeq), 800);
        } else {
          setPlayerIndex(nextIdx);
        }
      } else {
        setFinalScore(sequence.length - 1);
        updateScore('sequence-memory', sequence.length - 1);
        setPhase('result');
      }
    },
    [phase, sequence, playerIndex, addRound, playSequence, updateScore],
  );

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
      {phase === 'idle' && (
        <div className="text-center">
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            观察灯光闪烁的顺序，然后按相同顺序点击。
            <br />
            每轮会增加一个新的颜色。
          </p>
          <button onClick={startTest} className="btn-primary">
            开始测试
          </button>
        </div>
      )}

      {(phase === 'showing' || phase === 'playing') && (
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="font-display text-xl">
              <span className="text-white/40">轮次:</span>
              <span className="font-bold text-neon-cyan ml-2">{sequence.length}</span>
            </div>
            {phase === 'playing' && (
              <div className="text-white/40 text-sm">
                输入: {playerIndex}/{sequence.length}
              </div>
            )}
            {phase === 'showing' && (
              <div className="text-neon-cyan text-sm animate-pulse">
                观察...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 aspect-square">
            {COLORS.map((color, idx) => {
              const isActive =
                showingIndex === idx || activeIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleColorClick(idx)}
                  disabled={phase !== 'playing'}
                  className="aspect-square rounded-2xl transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? color : color + '40',
                    border: isActive ? `2px solid ${color}` : '2px solid transparent',
                    boxShadow: isActive ? `0 0 40px ${color}80` : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    cursor: phase === 'playing' ? 'pointer' : 'default',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <ResultDisplay
          test={test}
          score={finalScore}
          onRetry={startTest}
          stats={[
            { label: '序列长度', value: `${sequence.length}` },
          ]}
        />
      )}
    </div>
    </TestLayout>
  );
}
