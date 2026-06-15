import { useState, useRef, useCallback, useEffect } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { TESTS, MATH_DIFFICULTY, DIFFICULTY_OPTIONS, type MathDifficultyConfig } from '@/types';
import { useTestFlow } from '@/hooks/useTestFlow';

type Phase = 'select-difficulty' | 'idle' | 'playing' | 'result';

interface Question {
  a: number;
  b: number;
  op: '+' | '-' | '×' | '÷';
  answer: number;
}

function generateQuestion(config: MathDifficultyConfig): Question {
  const op = config.ops[Math.floor(Math.random() * config.ops.length)];
  let a: number, b: number, answer: number;

  if (op === '÷') {
    b = Math.floor(Math.random() * 11) + 2;
    answer = Math.floor(Math.random() * Math.floor(config.maxBase / b)) + 1;
    a = answer * b;
  } else if (op === '+') {
    a = Math.floor(Math.random() * config.maxBase) + 1;
    b = Math.floor(Math.random() * config.maxBase) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * config.maxBase) + 1;
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
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { phase, setPhase, difficulty, config, startTimer, finishTest, restart, selectDifficulty, timeLeft, startCountdown } =
    useTestFlow<Phase, MathDifficultyConfig>({
      testId: 'math-speed',
      difficultyConfig: MATH_DIFFICULTY,
      onReset: () => {
        setCorrectCount(0);
        setWrongCount(0);
        setQuestion(null);
        setInput('');
      },
    });

  const handleDifficultySelect = (level: Parameters<typeof selectDifficulty>[0]) => {
    selectDifficulty(level);
    startCountdown(MATH_DIFFICULTY[level].timeLimit);
  };

  const startTest = useCallback(() => {
    if (!config) return;
    startTimer();
    startCountdown(config.timeLimit);
    setCorrectCount(0);
    setWrongCount(0);
    setQuestion(generateQuestion(config));
    setInput('');
    setPhase('playing');

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [config, setPhase, startTimer, startCountdown]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      const timeLimitMs = (config?.timeLimit ?? 60) * 1000;
      finishTest(correctCount, timeLimitMs);
    }
  }, [timeLeft, phase, correctCount, finishTest, config]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!question || !input || !config) return;

      const userAnswer = parseInt(input, 10);
      if (userAnswer === question.answer) {
        setCorrectCount((c) => c + 1);
      } else {
        setWrongCount((w) => w + 1);
      }
      setQuestion(generateQuestion(config));
      setInput('');
    },
    [question, input, config],
  );

  const difficultyLabel = difficulty
    ? DIFFICULTY_OPTIONS.find((d) => d.level === difficulty)?.name ?? ''
    : '';

  const diffOpt = difficulty ? DIFFICULTY_OPTIONS.find((d) => d.level === difficulty) : null;

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
        {phase === 'select-difficulty' && (
          <div className="text-center">
            <p className="text-white/60 mb-6 max-w-lg mx-auto leading-relaxed">
              选择一个难度等级开始速算测试。
              <br />
              在限定时间内尽可能多地计算数学题，输入答案后按回车提交。
            </p>
            <DifficultySelector
              selected={difficulty}
              onSelect={handleDifficultySelect}
              testColor={test.color}
            />
          </div>
        )}

        {phase === 'idle' && difficulty && (
          <div className="text-center">
            <div className="mb-4">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${diffOpt!.color}20`,
                  border: `1px solid ${diffOpt!.color}40`,
                  color: diffOpt!.color,
                }}
              >
                {diffOpt!.name}
              </span>
            </div>
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              在 {config!.timeLimit} 秒内尽可能多地计算数学题。
              <br />
              {difficulty === 'easy' && '仅包含加法和减法运算。'}
              {difficulty === 'normal' && '包含加法、减法和乘法运算。'}
              {difficulty === 'hard' && '包含加法、减法、乘法和除法运算。'}
              <br />
              输入答案后按回车提交。
            </p>
            <button onClick={startTest} className="btn-primary">
              开始测试
            </button>
          </div>
        )}

        {phase === 'playing' && question && difficulty && (
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
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${diffOpt!.color}20`,
                  border: `1px solid ${diffOpt!.color}40`,
                  color: diffOpt!.color,
                }}
              >
                {diffOpt!.name}
              </span>
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
            onRetry={() => {
              if (difficulty) startCountdown(MATH_DIFFICULTY[difficulty].timeLimit);
              restart();
            }}
            stats={[
              { label: '难度', value: difficultyLabel },
              { label: '正确数', value: `${correctCount}` },
              { label: '错误数', value: `${wrongCount}` },
              { label: '用时', value: `${config?.timeLimit ?? 60}s` },
            ]}
          />
        )}
      </div>
    </TestLayout>
  );
}
