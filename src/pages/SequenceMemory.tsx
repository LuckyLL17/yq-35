import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { TESTS, DifficultyLevel, SEQUENCE_DIFFICULTY } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'select-difficulty' | 'idle' | 'showing' | 'playing' | 'result';

const ALL_COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899'];

const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

export default function SequenceMemory() {
  const test = TESTS.find((t) => t.id === 'sequence-memory')!;
  const [phase, setPhase] = useState<Phase>('select-difficulty');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);
  const testStartRef = useRef(0);
  const updateScore = useScoreStore((s) => s.updateScore);
  const [searchParams] = useSearchParams();
  const isTrainingMode = searchParams.get('training') === '1';

  const config = difficulty ? SEQUENCE_DIFFICULTY[difficulty] : SEQUENCE_DIFFICULTY.normal;
  const colors = ALL_COLORS.slice(0, config.colorCount);

  const clearTimers = useCallback(() => {
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    timeoutRefs.current = [];
  }, []);

  const addRound = useCallback(
    (seq: number[]) => {
      const next = [...seq, Math.floor(Math.random() * config.colorCount)];
      return next;
    },
    [config.colorCount],
  );

  const playSequence = useCallback(
    (seq: number[]) => {
      setPhase('showing');
      clearTimers();

      seq.forEach((colorIdx, i) => {
        const onId = window.setTimeout(() => {
          setShowingIndex(colorIdx);
        }, i * config.showInterval + 300);
        const offId = window.setTimeout(() => {
          setShowingIndex(null);
        }, i * config.showInterval + 300 + config.showDuration);
        timeoutRefs.current.push(onId, offId);
      });

      const endId = window.setTimeout(() => {
        setPhase('playing');
        setPlayerIndex(0);
      }, seq.length * config.showInterval + 500);
      timeoutRefs.current.push(endId);
    },
    [clearTimers, config.showInterval, config.showDuration],
  );

  const startTest = useCallback(() => {
    clearTimers();
    testStartRef.current = Date.now();
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
          const duration = Date.now() - testStartRef.current;
          updateScore('sequence-memory', sequence.length, duration);
          const nextSeq = addRound(sequence);
          setSequence(nextSeq);
          setTimeout(() => playSequence(nextSeq), 800);
        } else {
          setPlayerIndex(nextIdx);
        }
      } else {
        setFinalScore(sequence.length - 1);
        const duration = Date.now() - testStartRef.current;
        updateScore('sequence-memory', sequence.length - 1, duration);
        setPhase('result');
      }
    },
    [phase, sequence, playerIndex, addRound, playSequence, updateScore],
  );

  useEffect(() => {
    if (isTrainingMode && phase === 'select-difficulty') {
      setDifficulty('normal');
      setPhase('idle');
    }
  }, [isTrainingMode, phase]);

  const handleDifficultySelect = useCallback((level: DifficultyLevel) => {
    setDifficulty(level);
    setPhase('idle');
  }, []);

  const handleRestart = useCallback(() => {
    clearTimers();
    if (isTrainingMode) {
      setPhase('idle');
      setSequence([]);
      setPlayerIndex(0);
      setActiveIndex(null);
      setFinalScore(0);
      setShowingIndex(null);
    } else {
      setDifficulty(null);
      setPhase('select-difficulty');
      setSequence([]);
      setPlayerIndex(0);
      setActiveIndex(null);
      setFinalScore(0);
      setShowingIndex(null);
    }
  }, [clearTimers, isTrainingMode]);

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
      {phase === 'select-difficulty' && (
        <div className="text-center">
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            观察灯光闪烁的顺序，然后按相同顺序点击。
            <br />
            每轮会增加一个新的颜色。
          </p>
          <DifficultySelector
            selected={difficulty}
            onSelect={handleDifficultySelect}
            testColor={test.color}
          />
        </div>
      )}

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
            {difficulty && (
              <span
                className="text-xs font-display font-bold px-2 py-1 rounded-full"
                style={{
                  color: SEQUENCE_DIFFICULTY[difficulty].colorCount === 6 ? '#10b981' : difficulty === 'hard' ? '#ef4444' : '#00d4ff',
                  border: '1px solid currentColor',
                }}
              >
                {DIFFICULTY_LABEL[difficulty]}
              </span>
            )}
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

          <div
            className={`grid gap-4 ${
              config.colorCount === 6 ? 'grid-cols-3' : 'grid-cols-2'
            } aspect-square`}
          >
            {colors.map((color, idx) => {
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
          onRetry={handleRestart}
          stats={[
            { label: '序列长度', value: `${sequence.length}` },
            ...(difficulty ? [{ label: '难度', value: DIFFICULTY_LABEL[difficulty] }] : []),
          ]}
        />
      )}
    </div>
    </TestLayout>
  );
}
