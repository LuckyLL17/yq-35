import { useState, useEffect, useRef, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'idle' | 'playing' | 'result';

interface Question {
  a: number;
  b: number;
  op: '+' | '-' | '×';
  answer: number;
}

function generateQuestion(difficulty: number): Question {
  const ops: ('+' | '-' | '×')[] = difficulty < 10 ? ['+', '-'] : ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  const max = Math.min(20 + difficulty * 3, 99);

  if (op === '+') {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 12) + 2;
    answer = a * b;
  }

  return { a, b, op, answer };
}

export default function MathSpeed() {
  const test = TESTS.find((t) => t.id === 'math-speed')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);

  const startTest = useCallback(() => {
    setTimeLeft(60);
    setCorrectCount(0);
    setWrongCount(0);
    setDifficulty(1);
    setQuestion(generateQuestion(1));
    setInput('');
    setPhase('playing');

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      updateScore('math-speed', correctCount, 60000);
      setPhase('result');
    }
  }, [timeLeft, phase, correctCount, updateScore]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!question || !input) return;

      const userAnswer = parseInt(input, 10);
      if (userAnswer === question.answer) {
        setCorrectCount((c) => {
          const nc = c + 1;
          setDifficulty(Math.floor(nc / 5) + 1);
          return nc;
        });
      } else {
        setWrongCount((w) => w + 1);
      }
      setQuestion(generateQuestion(difficulty));
      setInput('');
    },
    [question, input, difficulty],
  );

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
        {phase === 'idle' && (
          <div className="text-center">
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              在 60 秒内尽可能多地计算数学题。
              <br />
              答对越多难度会逐渐增加。输入答案后按回车提交。
            </p>
            <button onClick={startTest} className="btn-primary">
              开始测试
            </button>
          </div>
        )}

        {phase === 'playing' && question && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-white/40">剩余时间</div>
                  <div className="font-display font-bold text-3xl text-neon-green">{timeLeft}s</div>
                </div>
                <div>
                  <div className="text-xs text-white/40">正确</div>
                  <div className="font-display font-bold text-3xl text-neon-green">{correctCount}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40">难度</div>
                  <div className="font-display font-bold text-3xl text-neon-cyan">{difficulty}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="text-center">
              <div
                className="font-display font-black text-6xl md:text-7xl mb-8 text-gradient animate-fade-in"
                key={question.a + question.op + question.b}
              >
                {question.a} {question.op} {question.b} = ?
              </div>
              <input
                ref={inputRef}
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full max-w-xs text-center font-mono text-4xl font-bold bg-white/5 border border-white/20 focus:border-neon-green/50 rounded-xl py-4 px-4 outline-none"
                placeholder="答案"
                autoFocus
              />
              <p className="mt-4 text-white/40 text-sm">错误: {wrongCount}</p>
            </form>
          </div>
        )}

        {phase === 'result' && (
          <ResultDisplay
            test={test}
            score={correctCount}
            onRetry={startTest}
            stats={[
              { label: '正确数', value: `${correctCount}` },
              { label: '错误数', value: `${wrongCount}` },
              { label: '达到难度', value: `${difficulty}` },
              { label: '用时', value: '60s' },
            ]}
          />
        )}
      </div>
    </TestLayout>
  );
}
