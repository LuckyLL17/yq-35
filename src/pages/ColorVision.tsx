import { useState, useCallback } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { TESTS, DIFFICULTY_OPTIONS, COLOR_VISION_DIFFICULTY } from '@/types';
import { useTestFlow } from '@/hooks/useTestFlow';

type Phase = 'select-difficulty' | 'idle' | 'playing' | 'result';

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getGridSize(level: number, diffMultiplier: number): { size: number; diff: number } {
  if (level <= 2) return { size: 2, diff: Math.max(1, Math.round(15 * diffMultiplier)) };
  if (level <= 4) return { size: 3, diff: Math.max(1, Math.round(12 * diffMultiplier)) };
  if (level <= 6) return { size: 3, diff: Math.max(1, Math.round(10 * diffMultiplier)) };
  if (level <= 9) return { size: 4, diff: Math.max(1, Math.round(8 * diffMultiplier)) };
  if (level <= 12) return { size: 4, diff: Math.max(1, Math.round(6 * diffMultiplier)) };
  if (level <= 16) return { size: 5, diff: Math.max(1, Math.round(5 * diffMultiplier)) };
  if (level <= 20) return { size: 5, diff: Math.max(1, Math.round(4 * diffMultiplier)) };
  return { size: 6, diff: Math.max(1, Math.round(3 * diffMultiplier)) };
}

export default function ColorVision() {
  const test = TESTS.find((t) => t.id === 'color-vision')!;
  const [level, setLevel] = useState(1);
  const [diffIdx, setDiffIdx] = useState(0);
  const [baseColor, setBaseColor] = useState('#ffffff');
  const [finalLevel, setFinalLevel] = useState(0);
  const [lives, setLives] = useState(3);

  const { phase, setPhase, difficulty, config, startTimer, finishTest, restart, selectDifficulty } =
    useTestFlow<Phase, typeof COLOR_VISION_DIFFICULTY.normal>({
      testId: 'color-vision',
      difficultyConfig: COLOR_VISION_DIFFICULTY,
      onReset: () => {
        setLevel(1);
        setDiffIdx(0);
        setFinalLevel(0);
        setLives(config.lives);
      },
    });

  const generateLevel = useCallback(
    (lvl: number) => {
      const { size } = getGridSize(lvl, config.diffMultiplier);
      const total = size * size;
      const h = Math.random();
      const s = 0.5 + Math.random() * 0.3;
      const l = 0.35 + Math.random() * 0.3;
      const [r, g, b] = hslToRgb(h, s, l);
      setBaseColor(`rgb(${r}, ${g}, ${b})`);
      setDiffIdx(Math.floor(Math.random() * total));
    },
    [config.diffMultiplier],
  );

  const startTest = useCallback(() => {
    startTimer();
    setLevel(1);
    setLives(config.lives);
    generateLevel(1);
    setPhase('playing');
  }, [generateLevel, config.lives, setPhase, startTimer]);

  const handleClick = useCallback(
    (idx: number) => {
      if (idx === diffIdx) {
        const nextLvl = level + 1;
        setLevel(nextLvl);
        generateLevel(nextLvl);
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setFinalLevel(level - 1);
          finishTest(level - 1);
        } else {
          generateLevel(level);
        }
      }
    },
    [diffIdx, level, lives, generateLevel, finishTest],
  );

  const { size } = getGridSize(level, config.diffMultiplier);
  const total = size * size;

  const getDifferentColor = () => {
    const { diff } = getGridSize(level, config.diffMultiplier);
    const match = baseColor.match(/\d+/g);
    if (!match) return baseColor;
    const [r, g, b] = match.map(Number);
    const adjust = (c: number) =>
      Math.max(0, Math.min(255, c + (Math.random() > 0.5 ? diff : -diff)));
    return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
  };

  const diffOpt = difficulty ? DIFFICULTY_OPTIONS.find((d) => d.level === difficulty) : null;

  return (
    <TestLayout test={test}>
      <div className="glass-card p-6 md:p-8">
        {phase === 'select-difficulty' && (
          <div className="text-center">
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              找出颜色不同的方块。
              <br />
              选择难度后开始测试。
            </p>
            <DifficultySelector
              selected={difficulty}
              onSelect={selectDifficulty}
              testColor={test.color}
            />
          </div>
        )}

        {phase === 'idle' && (
          <div className="text-center">
            {diffOpt && (
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${diffOpt.color}20`,
                    border: `1px solid ${diffOpt.color}40`,
                    color: diffOpt.color,
                  }}
                >
                  {diffOpt.name}
                </span>
              </div>
            )}
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              找出颜色不同的方块。
              <br />
              共 {config.lives} 条命，难度随关卡增加。
            </p>
            <button onClick={startTest} className="btn-primary">
              开始测试
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-white/40">关卡:</span>
                <span className="font-display font-bold text-2xl text-neon-orange">{level}</span>
                {diffOpt && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      backgroundColor: `${diffOpt.color}20`,
                      border: `1px solid ${diffOpt.color}40`,
                      color: diffOpt.color,
                    }}
                  >
                    {diffOpt.name}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: config.lives }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${i < lives ? 'text-neon-red' : 'text-white/10'}`}
                  >
                    ♥
                  </span>
                ))}
              </div>
            </div>

            <div
              className="max-w-md mx-auto grid gap-2"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {Array.from({ length: total }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleClick(idx)}
                  className="aspect-square rounded-lg transition-all duration-150 hover:scale-95 active:scale-90"
                  style={{ backgroundColor: idx === diffIdx ? getDifferentColor() : baseColor }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <ResultDisplay
            test={test}
            score={finalLevel}
            onRetry={restart}
            stats={[
              { label: '到达关卡', value: `${level}` },
              ...(diffOpt ? [{ label: '难度', value: diffOpt.name }] : []),
            ]}
          />
        )}
      </div>
    </TestLayout>
  );
}
