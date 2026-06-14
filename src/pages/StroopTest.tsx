import { useState, useEffect, useRef, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'idle' | 'showing' | 'playing' | 'result';

const COLORS = [
  { id: 0, color: '#ef4444', name: '红' },
  { id: 1, color: '#10b981', name: '绿' },
  { id: 2, color: '#3b82f6', name: '蓝' },
  { id: 3, color: '#f59e0b', name: '黄' },
];

const COLOR_NAMES_CN = ['红', '绿', '蓝', '黄'];

type Question = {
  textColor: number;
  displayColor: number;
};

function generateQuestion(): Question {
  const textColor = Math.floor(Math.random() * 4);
  let displayColor = Math.floor(Math.random() * 4);
  while (displayColor === textColor) {
    displayColor = Math.floor(Math.random() * 4);
  }
  return { textColor, displayColor };
}

export default function StroopTest() {
  const test = TESTS.find((t) => t.id === 'stroop')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [question, setQuestion] = useState<Question | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const feedbackRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);

  const startTest = useCallback(() => {
    setScore(0);
    setTimeLeft(45);
    setCorrectCount(0);
    setWrongCount(0);
    setQuestion(generateQuestion());
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
  }, []);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      updateScore('stroop', correctCount);
      setScore(correctCount);
      setPhase('result');
    }
  }, [timeLeft, phase, correctCount, updateScore]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswer = (colorId: number) => {
    if (!question || phase !== 'playing') return;

    if (colorId === question.displayColor) {
      setCorrectCount((c) => c + 1);
      feedbackRef.current = 0;
    } else {
      setWrongCount((w) => w + 1);
      feedbackRef.current = 1;
    }
    setQuestion(generateQuestion());
    setTimeout(() => {
      feedbackRef.current = null;
    }, 100);
  };

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
        {phase === 'idle' && (
          <div className="text-center">
            <p className="text-white/60 mb-6 max-w-lg mx-auto leading-relaxed">
              Stroop 效应测试：屏幕会显示一个颜色词，但文字的显示颜色和词的含义不同。
              <br />
              请选择<strong className="text-neon-purple"> 文字显示的颜色 </strong>
              （不是词的含义）。
              <br />
              限时 45 秒，答对越多越好！
            </p>
            <div className="mb-6 flex justify-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <span
                  key={c.id}
                  className="px-4 py-2 rounded-lg text-white font-bold"
                  style={{
                    backgroundColor: c.color + '40',
                    borderColor: c.color + '60',
                    borderWidth: 1,
                  }}
                >
                  {c.name}
                </span>
              ))}
            </div>
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
                  <div className="font-display font-bold text-3xl text-neon-purple">
                    {timeLeft}s
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/40">正确</div>
                  <div className="font-display font-bold text-3xl text-neon-green">
                    {correctCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/40">错误</div>
                  <div className="font-display font-bold text-3xl text-neon-red">{wrongCount}</div>
                </div>
              </div>
            </div>

            <div className="text-center py-12 animate-pop-in" key={correctCount + wrongCount}>
              <div
                className="font-display text-6xl md:text-8xl font-black"
                style={{
                  color: COLORS[question.displayColor].color,
                  textShadow: `0 0 40px ${COLORS[question.displayColor].color}50`,
                }}
              >
                {COLOR_NAMES_CN[question.textColor]}
              </div>
              <p className="mt-4 text-white/40 text-sm">选择这个文字显示的颜色</p>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleAnswer(c.id)}
                  className="py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: c.color + '30',
                    borderColor: c.color + '60',
                    borderWidth: 2,
                    color: c.color,
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <ResultDisplay
            test={test}
            score={score}
            onRetry={startTest}
            stats={[
              { label: '正确数', value: `${correctCount}` },
              { label: '错误数', value: `${wrongCount}` },
              {
                label: '准确率',
                value: `${
                  correctCount + wrongCount > 0
                    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
                    : 0
                }%`,
              },
              { label: '用时', value: '45s' },
            ]}
          />
        )}
      </div>
    </TestLayout>
  );
}
