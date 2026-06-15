import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import DifficultySelector from '@/components/DifficultySelector';
import { TESTS, type DifficultyLevel, CHIMP_DIFFICULTY } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';

type Phase = 'select-difficulty' | 'idle' | 'showing' | 'playing' | 'result';

interface Cell {
  x: number;
  y: number;
  value: number;
}

function generateGrid(level: number, gridSize: number): Cell[] {
  const positions = new Set<string>();
  const cells: Cell[] = [];

  while (positions.size < level) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const key = `${x}-${y}`;
    if (positions.has(key)) continue;
    positions.add(key);
    cells.push({ x, y, value: cells.length + 1 });
  }

  return cells;
}

export default function ChimpTest() {
  const test = TESTS.find((t) => t.id === 'chimp')!;
  const [phase, setPhase] = useState<Phase>('select-difficulty');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [level, setLevel] = useState(4);
  const [cells, setCells] = useState<Cell[]>([]);
  const [nextNum, setNextNum] = useState(1);
  const [finalLevel, setFinalLevel] = useState(0);
  const [shaking, setShaking] = useState(false);
  const testStartRef = useRef(0);
  const updateScore = useScoreStore((s) => s.updateScore);
  const [searchParams] = useSearchParams();
  const isTrainingMode = searchParams.get('training') === '1';

  const config = difficulty ? CHIMP_DIFFICULTY[difficulty] : CHIMP_DIFFICULTY.normal;

  const startLevel = useCallback((lvl: number, gridSize: number, showTimeBase: number, showTimePerCell: number) => {
    const grid = generateGrid(lvl, gridSize);
    setCells(grid);
    setNextNum(1);
    setPhase('showing');

    const showTime = showTimeBase + lvl * showTimePerCell;
    setTimeout(() => setPhase('playing'), showTime);
  }, []);

  const startTest = useCallback(() => {
    testStartRef.current = Date.now();
    const cfg = CHIMP_DIFFICULTY[difficulty!];
    setLevel(cfg.startLevel);
    startLevel(cfg.startLevel, cfg.gridSize, cfg.showTimeBase, cfg.showTimePerCell);
  }, [difficulty, startLevel]);

  const handleCellClick = (cell: Cell) => {
    if (phase !== 'playing') return;

    if (cell.value === nextNum) {
        if (nextNum >= cells.length) {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          setTimeout(() => startLevel(nextLvl, config.gridSize, config.showTimeBase, config.showTimePerCell), 300);
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

  useEffect(() => {
    if (isTrainingMode && phase === 'select-difficulty') {
      const cfg = CHIMP_DIFFICULTY.normal;
      setDifficulty('normal');
      setLevel(cfg.startLevel);
      setPhase('idle');
    }
  }, [isTrainingMode, phase]);

  const handleDifficultySelect = useCallback((lvl: DifficultyLevel) => {
    setDifficulty(lvl);
    setLevel(CHIMP_DIFFICULTY[lvl].startLevel);
    setPhase('idle');
  }, []);

  const handleRestart = useCallback(() => {
    if (isTrainingMode) {
      const cfg = CHIMP_DIFFICULTY[difficulty ?? 'normal'];
      setLevel(cfg.startLevel);
      setPhase('idle');
    } else {
      setDifficulty(null);
      setPhase('select-difficulty');
    }
  }, [isTrainingMode, difficulty]);

  const difficultyLabel = difficulty === 'easy' ? '简单' : difficulty === 'normal' ? '普通' : '困难';

  return (
    <TestLayout test={test}>
      <div className={`glass-card p-6 md:p-8 ${shaking ? 'animate-shake' : ''}`}>
      {phase === 'select-difficulty' && (
        <div className="text-center">
          <p className="text-white/60 mb-2 font-display text-4xl font-bold text-neon-yellow mb-6">
            黑猩猩测试
          </p>
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            屏幕上会显示带有数字的方块。
            <br />
            记住每个方块消失后，按数字从小到大依次点击。
          </p>
          <DifficultySelector selected={difficulty} onSelect={handleDifficultySelect} testColor={test.color} />
        </div>
      )}

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
          <div className="font-display text-lg flex items-center gap-2">
            <span className="text-white/40">关卡:</span>
            <span className="font-bold text-neon-yellow ml-2">{level}</span>
            <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: `${test.color}60`, color: test.color }}>
              {difficultyLabel}
            </span>
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

        <div className="relative w-full aspect-square max-w-md mx-auto">
          <div className={`absolute inset-0 grid gap-2`} style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${config.gridSize}, minmax(0, 1fr))` }}>
            {Array.from({ length: config.gridSize * config.gridSize }).map((_, idx) => {
              const x = idx % config.gridSize;
              const y = Math.floor(idx / config.gridSize);
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
          onRetry={handleRestart}
          stats={[
            { label: '到达关卡', value: `${level}` },
            { label: '记忆数字数', value: `${cells.length}` },
            { label: '难度', value: difficultyLabel },
          ]}
        />
      )}
    </div>
    </TestLayout>
  );
}
