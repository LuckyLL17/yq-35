import { useState, useEffect, useRef, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog while the sun sets behind the mountains, painting the sky in shades of orange and pink.',
  'Programming is the art of telling another human what one wants the computer to do, and every line of code is a step towards solving a problem.',
  'In the middle of difficulty lies opportunity, and those who persist through challenges often discover strengths they never knew they had.',
  'The only way to do great work is to love what you do, and if you have not found it yet, keep looking and never settle for less.',
  'Success is not final and failure is not fatal, it is the courage to continue that counts in the long journey of life and discovery.',
  'Technology is best when it brings people together, creating connections that transcend borders and build bridges between different cultures.',
];

type Phase = 'idle' | 'playing' | 'result';

export default function TypingSpeed() {
  const test = TESTS.find((t) => t.id === 'typing')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [text] = useState(
    () => SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)],
  );
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const correctChars = input.split('').filter((c, i) => c === text[i]).length;
    const correctWords = Math.floor(correctChars / 5);

    updateScore('typing', correctWords);
    setPhase('result');
  }, [input, text, updateScore]);

  const startTest = useCallback(() => {
    setPhase('playing');
    setTimeLeft(60);
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
  }, []);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      finishTest();
    }
  }, [timeLeft, phase, finishTest]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleRestart = () => {
    setPhase('idle');
  };

  const correctChars = input.split('').filter((c, i) => c === text[i]).length;
  const finalWPM = phase === 'result' ? Math.floor(correctChars / 5) : 0;
  const currentWPM = phase === 'playing' ? Math.floor(correctChars / 5) : 0;

  const stats =
    phase === 'result'
      ? [
          { label: '正确字符', value: `${correctChars}/${text.length}` },
          { label: '总字符数', value: `${input.length}` },
          {
            label: '准确率',
            value: `${
              input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0
            }%`,
          },
          { label: '用时', value: '60s' },
        ]
      : [];

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
        {phase === 'idle' && (
          <div className="text-center">
            <p className="text-white/60 mb-6 max-w-lg mx-auto leading-relaxed">
              在 60 秒内尽可能准确地输入下方文字。
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

        {phase === 'playing' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="font-display text-3xl font-bold text-neon-pink">
                  {timeLeft}s
                </div>
                <div className="text-white/40">剩余时间</div>
              </div>
              <div className="text-white/40 text-sm">{currentWPM} WPM</div>
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
