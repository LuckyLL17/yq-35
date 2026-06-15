import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { TESTS, DifficultyLevel, TYPING_DIFFICULTY } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'select-difficulty' | 'idle' | 'playing' | 'result';

export default function TypingSpeed() {
  const test = TESTS.find((t) => t.id === 'typing')!;
  const [phase, setPhase] = useState<Phase>('select-difficulty');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);
  const [searchParams] = useSearchParams();
  const isTrainingMode = searchParams.get('training') === '1';

  const config = difficulty ? TYPING_DIFFICULTY[difficulty] : null;

  const handleDifficultySelect = (level: DifficultyLevel) => {
    const cfg = TYPING_DIFFICULTY[level];
    setDifficulty(level);
    setText(cfg.textPool[Math.floor(Math.random() * cfg.textPool.length)]);
    setTimeLeft(cfg.timeLimit);
    setPhase('idle');
  };

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const correctChars = input.split('').filter((c, i) => c === text[i]).length;
    const correctWords = Math.floor(correctChars / 5);
    const timeLimitMs = (config?.timeLimit ?? 60) * 1000;

    updateScore('typing', correctWords, timeLimitMs);
    setPhase('result');
  }, [input, text, updateScore, config]);

  const startTest = useCallback(() => {
    setPhase('playing');
    setTimeLeft(config?.timeLimit ?? 60);
    setInput('');

    setTimeout(() => textareaRef.current?.focus(), 50);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [config]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      finishTest();
    }
  }, [timeLeft, phase, finishTest]);

  useEffect(() => {
    if (isTrainingMode && phase === 'select-difficulty') {
      const cfg = TYPING_DIFFICULTY.normal;
      setDifficulty('normal');
      setText(cfg.textPool[Math.floor(Math.random() * cfg.textPool.length)]);
      setTimeLeft(cfg.timeLimit);
      setPhase('idle');
    }
  }, [isTrainingMode, phase]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleRestart = () => {
    if (isTrainingMode) {
      const cfg = TYPING_DIFFICULTY[difficulty ?? 'normal'];
      setText(cfg.textPool[Math.floor(Math.random() * cfg.textPool.length)]);
      setTimeLeft(cfg.timeLimit);
      setPhase('idle');
    } else {
      setDifficulty(null);
      setText('');
      setPhase('select-difficulty');
    }
  };

  const correctChars = input.split('').filter((c, i) => c === text[i]).length;
  const finalWPM = phase === 'result' ? Math.floor(correctChars / 5) : 0;
  const currentWPM = phase === 'playing' ? Math.floor(correctChars / 5) : 0;

  const difficultyLabel = difficulty
    ? { easy: '简单', normal: '普通', hard: '困难' }[difficulty]
    : '';

  const stats =
    phase === 'result'
      ? [
          { label: '难度', value: difficultyLabel },
          { label: '正确字符', value: `${correctChars}/${text.length}` },
          { label: '总字符数', value: `${input.length}` },
          {
            label: '准确率',
            value: `${
              input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0
            }%`,
          },
          { label: '用时', value: `${config?.timeLimit ?? 60}s` },
        ]
      : [];

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
        {phase === 'select-difficulty' && (
          <div className="text-center">
            <p className="text-white/60 mb-6 max-w-lg mx-auto leading-relaxed">
              选择一个难度等级开始打字测试。
              <br />
              WPM (每分钟单词数) = 正确字符数 / 5
            </p>
            <DifficultySelector
              selected={difficulty}
              onSelect={handleDifficultySelect}
              testColor={test.color}
            />
          </div>
        )}

        {phase === 'idle' && config && (
          <div className="text-center">
            <p className="text-white/60 mb-6 max-w-lg mx-auto leading-relaxed">
              在 {config.timeLimit} 秒内尽可能准确地输入下方文字。
              <br />
              WPM (每分钟单词数) = 正确字符数 / 5
            </p>
            <div className="mb-8 text-left bg-white/5 rounded-xl p-6 text-lg leading-relaxed text-white/70">
              {text}
            </div>
            <button onClick={startTest} className="btn-primary">
              开始测试
            </button>
          </div>
        )}

        {phase === 'playing' && config && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="font-display text-3xl font-bold text-neon-pink">
                  {timeLeft}s
                </div>
                <div className="text-white/40">剩余时间</div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="text-xs font-display font-bold px-2 py-1 rounded-md"
                  style={{
                    color: TYPING_DIFFICULTY[difficulty!].timeLimit === 90 ? '#10b981' : TYPING_DIFFICULTY[difficulty!].timeLimit === 60 ? '#00d4ff' : '#ef4444',
                    backgroundColor: TYPING_DIFFICULTY[difficulty!].timeLimit === 90 ? '#10b98120' : TYPING_DIFFICULTY[difficulty!].timeLimit === 60 ? '#00d4ff20' : '#ef444420',
                    border: `1px solid ${TYPING_DIFFICULTY[difficulty!].timeLimit === 90 ? '#10b98140' : TYPING_DIFFICULTY[difficulty!].timeLimit === 60 ? '#00d4ff40' : '#ef444440'}`,
                  }}
                >
                  {difficultyLabel}
                </span>
                <div className="text-white/40 text-sm">{currentWPM} WPM</div>
              </div>
            </div>

            <div className="mb-4 bg-white/5 rounded-xl p-6 text-lg leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
              {text.split('').map((char, i) => {
                let cls = 'text-white/30';
                if (i < input.length) {
                  cls =
                    input[i] === char
                      ? 'text-neon-green'
                      : 'text-neon-red bg-neon-red/20';
                } else if (i === input.length) {
                  cls = 'text-white bg-neon-pink/30';
                }
                return (
                  <span key={i} className={cls}>
                    {char}
                  </span>
                );
              })}
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              className="w-full h-40 bg-white/5 border border-white/15 focus:border-neon-pink/40 rounded-xl p-4 text-lg font-mono outline-none resize-none scrollbar-thin"
              placeholder="开始输入..."
              autoFocus
            />

            <div className="mt-4 flex justify-end">
              <button onClick={finishTest} className="btn-secondary">
                提前结束
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <ResultDisplay test={test} score={finalWPM} stats={stats} onRetry={handleRestart} />
        )}
      </div>
    </TestLayout>
  );
}
