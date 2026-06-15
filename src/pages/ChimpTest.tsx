import { useState, useCallback, useRef } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'idle' | 'showing' | 'playing' | 'result';

interface Cell {
  x: number;
  y: number;
  value: number;
}

function generateGrid(level: number): Cell[] {
  const positions = new Set<string>();
  const cells: Cell[] = [];

  while (positions.size < level) {
    const x = Math.floor(Math.random() * 4);
    const y = Math.floor(Math.random() * 4);
    const key = `${x}-${y}`;
    if (positions.has(key)) continue;
    positions.add(key);
    cells.push({ x, y, value: cells.length + 1 });
  }

  return cells;
}

export default function ChimpTest() {
  const test = TESTS.find((t) => t.id === 'chimp')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState(4);
  const [cells, setCells] = useState<Cell[]>([]);
  const [nextNum, setNextNum] = useState(1);
  const [finalLevel, setFinalLevel] = useState(0);
  const [shaking, setShaking] = useState(false);
  const testStartRef = useRef(0);
  const updateScore = useScoreStore((s) => s.updateScore);

  const startLevel = useCallback((lvl: number) => {
    const grid = generateGrid(lvl);
    setCells(grid);
    setNextNum(1);
    setPhase('showing');

    const showTime = 800 + lvl * 300;
    setTimeout(() => setPhase('playing'), showTime);
  }, []);

  const startTest = useCallback(() => {
    testStartRef.current = Date.now();
    setLevel(4);
    startLevel(4);
  }, [startLevel]);

  const handleCellClick = (cell: Cell) => {
    if (phase !== 'playing') return;

    if (cell.value === nextNum) {
      if (nextNum >= cells.length) {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          setTimeout(() => startLevel(nextLvl), 300);
        } else {
          setNextNum(nextNum + 1);
        }
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 300);
        const finalLvl = Math.max(0, level - 1);
        setFinalLevel(finalLvl);
        const duration = Date.now() - testStartRef.current;
        updateScore('chimp', finalLvl, duration);
        setPhase('result');
      }
  };

  return (
    <TestLayout test={test}>
      <div className={`glass-card p-6 md:p-8 ${shaking ? 'animate-shake' : ''}`}>
      {phase === 'idle' && (
        <div className="text-center">
          <p className="text-white/60 mb-2 font-display text-4xl font-bold text-neon-yellow mb-6">
            第 {level} 个数字
          </p>
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            屏幕上会显示带有数字的方块。
            <br />
            记住每个方块消失后，按数字从小到大依次点击。
          </p>
          <button onClick={startTest} className="btn-primary">
            开始测试
          </button>
        </div>
      )}

      {(phase === 'showing' || phase === 'playing') && (
        <div>
          <div className="flex items-center justify-between mb-6">
          <div className="font-display text-lg">
            <span className="text-white/40">关卡:</span>
            <span className="font-bold text-neon-yellow ml-2">{level}</span>
          </div>
          {phase === 'playing' && (
            <div className="text-white/40 text-sm">
              下一个: <span className="font-bold text-neon-green text-lg">{nextNum}</span>
            </div>
          )}
          {phase === 'showing' && (
            <div className="text-neon-yellow text-sm animate-pulse">
              记住位置...
            </div>
          )}
        </div>

        <div className="relative w-full aspect-[4/3] max-w-md mx-auto">
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2">
            {Array.from({ length: 16 }).map((_, idx) => {
              const x = idx % 4;
              const y = Math.floor(idx / 4);
              const cell = cells.find((c) => c.x === x && c.y === y);
              const isShown = phase === 'showing' || (phase === 'playing' && cell && cell.value < nextNum);
              const isClickable = phase === 'playing' && cell && cell.value >= nextNum;

              return (
                <button
                  key={idx}
                  onClick={() => cell && handleCellClick(cell)}
                  disabled={!isClickable}
                  className={`relative aspect-square rounded-lg flex items-center justify-center font-display font-bold text-2xl md:text-3xl transition-all duration-200 ${
                    isShown
                      ? 'bg-neon-yellow/80 text-bg-primary'
                      : cell && isClickable
                        ? 'bg-neon-yellow/20 border border-neon-yellow/40 text-transparent hover:bg-neon-yellow/30 cursor-pointer'
                        : 'bg-white/5 border border-white/10'
                  }`}
                  style={isShown ? { boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' } : undefined}
                >
                  {isShown && cell && cell.value}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {phase === 'result' && (
        <ResultDisplay
          test={test}
          score={finalLevel}
          onRetry={startTest}
          stats={[
            { label: '到达关卡', value: `${level}` },
            { label: '记忆数字数', value: `${cells.length}` },
          ]}
        />
      )}
    </div>
    </TestLayout>
  );
}
