import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { TESTS, DifficultyLevel, STROOP_DIFFICULTY } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'select-difficulty' | 'idle' | 'playing' | 'result';

const ALL_COLORS = [
  { id: 0, color: '#ef4444', name: '红' },
  { id: 1, color: '#10b981', name: '绿' },
  { id: 2, color: '#3b82f6', name: '蓝' },
  { id: 3, color: '#f59e0b', name: '黄' },
  { id: 4, color: '#a855f7', name: '紫' },
  { id: 5, color: '#ec4899', name: '粉' },
];

const ALL_COLOR_NAMES_CN = ['红', '绿', '蓝', '黄', '紫', '粉'];

const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

type Question = {
  textColor: number;
  displayColor: number;
};

function generateQuestion(colorCount: number): Question {
  const textColor = Math.floor(Math.random() * colorCount);
  let displayColor = Math.floor(Math.random() * colorCount);
  while (displayColor === textColor) {
    displayColor = Math.floor(Math.random() * colorCount);
  }
  return { textColor, displayColor };
}

function getGridCols(colorCount: number): string {
  if (colorCount <= 3) return 'grid-cols-3';
  if (colorCount <= 4) return 'grid-cols-4';
  return 'grid-cols-3';
}

export default function StroopTest() {
  const test = TESTS.find((t) => t.id === 'stroop')!;
  const [phase, setPhase] = useState<Phase>('select-difficulty');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [question, setQuestion] = useState<Question | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const feedbackRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);
  const [searchParams] = useSearchParams();
  const isTrainingMode = searchParams.get('training') === '1';

  const config = difficulty ? STROOP_DIFFICULTY[difficulty] : STROOP_DIFFICULTY.normal;
  const colors = ALL_COLORS.slice(0, config.colorCount);
  const colorNamesCN = ALL_COLOR_NAMES_CN.slice(0, config.colorCount);

  const handleDifficultySelect = useCallback((level: DifficultyLevel) => {
    setDifficulty(level);
    setPhase('idle');
  }, []);

  useEffect(() => {
    if (isTrainingMode && phase === 'select-difficulty') {
      setDifficulty('normal');
      setPhase('idle');
    }
  }, [isTrainingMode, phase]);

  const startTest = useCallback(() => {
    const cfg = difficulty ? STROOP_DIFFICULTY[difficulty] : STROOP_DIFFICULTY.normal;
    setScore(0);
    setTimeLeft(cfg.timeLimit);
    setCorrectCount(0);
    setWrongCount(0);
    setQuestion(generateQuestion(cfg.colorCount));
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
  }, [difficulty]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      const cfg = difficulty ? STROOP_DIFFICULTY[difficulty] : STROOP_DIFFICULTY.normal;
      updateScore('stroop', correctCount, cfg.timeLimit * 1000);
      setScore(correctCount);
      setPhase('result');
    }
  }, [timeLeft, phase, correctCount, updateScore, difficulty]);

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
    setQuestion(generateQuestion(config.colorCount));
    setTimeout(() => {
      feedbackRef.current = null;
    }, 100);
  };

  const handleRestart = () => {
    if (isTrainingMode) {
      setPhase('idle');
    } else {
      setDifficulty(null);
      setPhase('select-difficulty');
    }
  };

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
        {phase === 'select-difficulty' && (
          <div className="text-center">
            <DifficultySelector
              selected={difficulty}
              onSelect={handleDifficultySelect}
              testColor={test.color}
            />
          </div>
        )}

        {phase === 'idle' && (
          <div className="text-center">
            <div className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: difficulty === 'easy' ? '#10b98120' : difficulty === 'hard' ? '#ef444420' : '#00d4ff20',
                color: difficulty === 'easy' ? '#10b981' : difficulty === 'hard' ? '#ef4444' : '#00d4ff',
                border: `1px solid ${difficulty === 'easy' ? '#10b98140' : difficulty === 'hard' ? '#ef444440' : '#00d4ff40'}`,
              }}
            >
              {DIFFICULTY_LABEL[difficulty!]}模式
            </div>
            <p className="text-white/60 mb-6 max-w-lg mx-auto leading-relaxed">
              Stroop 效应测试：屏幕会显示一个颜色词，但文字的显示颜色和词的含义不同。
              <br />
              请选择<strong className="text-neon-purple"> 文字显示的颜色 </strong>
              （不是词的含义）。
              <br />
              限时 {config.timeLimit} 秒，答对越多越好！
            </p>
            <div className="mb-6 flex justify-center gap-2 flex-wrap">
              {colors.map((c) => (
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
              <div className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: difficulty === 'easy' ? '#10b98120' : difficulty === 'hard' ? '#ef444420' : '#00d4ff20',
                  color: difficulty === 'easy' ? '#10b981' : difficulty === 'hard' ? '#ef4444' : '#00d4ff',
                  border: `1px solid ${difficulty === 'easy' ? '#10b98140' : difficulty === 'hard' ? '#ef444440' : '#00d4ff40'}`,
                }}
              >
                {DIFFICULTY_LABEL[difficulty!]}
              </div>
            </div>

            <div className="text-center py-12 animate-pop-in" key={correctCount + wrongCount}>
              <div
                className="font-display text-6xl md:text-8xl font-black"
                style={{
                  color: colors[question.displayColor].color,
                  textShadow: `0 0 40px ${colors[question.displayColor].color}50`,
                }}
              >
                {colorNamesCN[question.textColor]}
              </div>
              <p className="mt-4 text-white/40 text-sm">选择这个文字显示的颜色</p>
            </div>

            <div className={`grid ${getGridCols(config.colorCount)} gap-3 max-w-md mx-auto`}>
              {colors.map((c) => (
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
            onRetry={handleRestart}
            stats={[
              { label: '难度', value: DIFFICULTY_LABEL[difficulty!] },
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
              { label: '用时', value: `${config.timeLimit}s` },
            ]}
          />
        )}
      </div>
    </TestLayout>
  );
}
