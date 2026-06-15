import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import TestLayout from '@/components/TestLayout';
import ResultDisplay from '@/components/ResultDisplay';
import { TESTS, REACTION_MODES, type ReactionMode } from '@/types';
import { useScoreStore } from '@/store/useScoreStore';
import { Eye, Volume2, Smartphone, Shuffle, Dice5, ChevronLeft } from 'lucide-react';

type Phase = 'select' | 'idle' | 'waiting' | 'ready' | 'too-early' | 'result';

const modeIcons: Record<ReactionMode, typeof Eye> = {
  visual: Eye,
  auditory: Volume2,
  tactile: Smartphone,
  mixed: Shuffle,
  random: Dice5,
};

const singleModes: ReactionMode[] = ['visual', 'auditory', 'tactile'];

function getNextMode(currentMode: ReactionMode, attemptIndex: number, isRandom: boolean): ReactionMode {
  if (isRandom) {
    return singleModes[Math.floor(Math.random() * singleModes.length)];
  }
  return singleModes[attemptIndex % singleModes.length];
}

export default function ReactionTime() {
  const test = TESTS.find((t) => t.id === 'reaction')!;
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedMode, setSelectedMode] = useState<ReactionMode | null>(null);
  const [currentMode, setCurrentMode] = useState<ReactionMode>('visual');
  const [reactionTime, setReactionTime] = useState(0);
  const [attempts, setAttempts] = useState<{ time: number; mode: ReactionMode }[]>([]);
  const startTimeRef = useRef(0);
  const testStartRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const updateScore = useScoreStore((s) => s.updateScore);

  const currentModeInfo = useMemo(
    () => REACTION_MODES.find((m) => m.id === currentMode)!,
    [currentMode]
  );

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextCtor();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore audio errors
    }
  }, [getAudioContext]);

  const triggerVibration = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, []);

  const triggerSignal = useCallback((mode: ReactionMode) => {
    if (mode === 'auditory') {
      playBeep();
    } else if (mode === 'tactile') {
      triggerVibration();
    }
  }, [playBeep, triggerVibration]);

  const startWait = useCallback(() => {
    if (testStartRef.current === 0) {
      testStartRef.current = performance.now();
    }
    setPhase('waiting');
    const delay = 1000 + Math.random() * 4000;
    timeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      triggerSignal(currentMode);
      setPhase('ready');
    }, delay);
  }, [currentMode, triggerSignal]);

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      startWait();
    } else if (phase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase('too-early');
    } else if (phase === 'ready') {
      const time = Math.round(performance.now() - startTimeRef.current);
      const newAttempts = [...attempts, { time, mode: currentMode }];
      setAttempts(newAttempts);
      setReactionTime(time);

      if (newAttempts.length >= 5) {
        const avg = Math.round(newAttempts.reduce((a, b) => a + b.time, 0) / newAttempts.length);
        const duration = Math.round(performance.now() - testStartRef.current);
        updateScore('reaction', avg, duration, { mode: selectedMode, attempts: newAttempts });
        testStartRef.current = 0;
      }
      setPhase('result');
    } else if (phase === 'too-early') {
      startWait();
    } else if (phase === 'result') {
      if (attempts.length >= 5) {
        setAttempts([]);
      }
      if (selectedMode === 'mixed' || selectedMode === 'random') {
        const nextMode = getNextMode(selectedMode, attempts.length, selectedMode === 'random');
        setCurrentMode(nextMode);
      }
      startWait();
    }
  }, [phase, attempts, currentMode, selectedMode, startWait, updateScore]);

  const handleModeSelect = useCallback((mode: ReactionMode) => {
    setSelectedMode(mode);
    const initialMode = mode === 'mixed' || mode === 'random'
      ? singleModes[0]
      : mode;
    setCurrentMode(initialMode);
    setAttempts([]);
    setPhase('idle');
  }, []);

  const handleBackToSelect = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSelectedMode(null);
    setAttempts([]);
    setPhase('select');
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getBgClass = () => {
    switch (phase) {
      case 'waiting':
        return 'bg-neon-red';
      case 'ready':
        return 'bg-neon-green';
      case 'too-early':
        return 'bg-neon-yellow';
      default:
        return currentModeInfo?.color ? '' : 'bg-neon-cyan';
    }
  };

  const getModeText = () => {
    switch (currentMode) {
      case 'visual':
        return {
          waiting: '等待绿色...',
          ready: '点击！',
          subtitle: '变绿后立即点击',
        };
      case 'auditory':
        return {
          waiting: '等待提示音...',
          ready: '点击！',
          subtitle: '听到声音后立即点击',
        };
      case 'tactile':
        return {
          waiting: '等待振动...',
          ready: '点击！',
          subtitle: '感受到振动后立即点击',
        };
    }
  };

  const getText = () => {
    const modeText = getModeText();
    switch (phase) {
      case 'idle':
        return { title: '反应时间测试', subtitle: '点击开始' };
      case 'waiting':
        return { title: modeText.waiting, subtitle: modeText.subtitle };
      case 'ready':
        return { title: modeText.ready, subtitle: '' };
      case 'too-early':
        return { title: '太早了！', subtitle: '点击重试' };
      case 'result':
        return {
          title: `${reactionTime} ms`,
          subtitle: attempts.length < 5 ? `点击继续 (${attempts.length}/5)` : `平均: ${Math.round(attempts.reduce((a, b) => a + b.time, 0) / attempts.length)} ms · 点击再试`,
        };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const avgScore =
    attempts.length >= 5
      ? Math.round(attempts.reduce((a, b) => a + b.time, 0) / attempts.length)
      : reactionTime;

  const text = getText();
  const ModeIcon = modeIcons[currentMode];

  if (phase === 'select') {
    return (
      <TestLayout test={test}>
        <div className="glass-card min-h-[500px] flex flex-col items-center justify-center p-8">
          <h2 className="font-display font-black text-4xl md:text-5xl mb-2">反应时间测试</h2>
          <p className="text-white/50 mb-8 text-center">选择一种反应模式开始测试</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
            {REACTION_MODES.map((mode) => {
              const Icon = modeIcons[mode.id];
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="glass-card-hover p-6 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105"
                  style={{
                    borderColor: `${mode.color}40`,
                    background: `linear-gradient(135deg, ${mode.color}10 0%, transparent 50%)`,
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${mode.color}20`,
                      border: `1px solid ${mode.color}40`,
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: mode.color }} />
                  </div>
                  <h3 className="font-display font-bold text-xl" style={{ color: mode.color }}>
                    {mode.name}
                  </h3>
                  <p className="text-sm text-white/50 text-center">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </TestLayout>
    );
  }

  return (
    <TestLayout test={test}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackToSelect}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">切换模式</span>
        </button>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            backgroundColor: `${currentModeInfo.color}20`,
            border: `1px solid ${currentModeInfo.color}40`,
          }}
        >
          <ModeIcon className="w-4 h-4" style={{ color: currentModeInfo.color }} />
          <span className="text-sm" style={{ color: currentModeInfo.color }}>
            {currentModeInfo.name}
          </span>
          {selectedMode && (selectedMode === 'mixed' || selectedMode === 'random') && (
            <span className="text-xs text-white/40">
              ({attempts.length + 1}/5)
            </span>
          )}
        </div>
      </div>

      <div
        onClick={handleClick}
        className={`glass-card min-h-[500px] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 border-2 ${getBgClass()}/10 hover:${getBgClass()}/20`}
        style={{
          borderColor: phase === 'waiting' ? 'rgba(239, 68, 68, 0.3)' : phase === 'ready' ? 'rgba(16, 185, 129, 0.5)' : undefined,
        }}
      >
        <h2
          className={`font-display font-black text-5xl md:text-7xl mb-4 transition-colors ${
            phase === 'ready' ? 'text-neon-green' : phase === 'waiting' ? 'text-neon-red' : phase === 'too-early' ? 'text-neon-yellow' : ''
          }`}
          style={
            phase === 'ready'
              ? { textShadow: '0 0 40px rgba(16, 185, 129, 0.6)' }
              : phase === 'waiting'
                ? { textShadow: '0 0 40px rgba(239, 68, 68, 0.6)' }
                : undefined
          }
        >
          {text.title}
        </h2>
        <p className="text-white/50 text-lg">{text.subtitle}</p>

        {attempts.length > 0 && phase === 'result' && (
          <div className="mt-8 flex gap-2 flex-wrap justify-center max-w-md">
            {attempts.map((attempt, i) => {
              const AttemptIcon = modeIcons[attempt.mode];
              const modeInfo = REACTION_MODES.find((m) => m.id === attempt.mode)!;
              return (
                <span
                  key={i}
                  className="font-mono text-sm px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1"
                  style={{ borderColor: `${modeInfo.color}30` }}
                >
                  <AttemptIcon className="w-3 h-3" style={{ color: modeInfo.color }} />
                  {attempt.time}ms
                </span>
              );
            })}
          </div>
        )}
      </div>

      {phase === 'result' && attempts.length >= 5 && (
        <div className="mt-6">
          <ResultDisplay
            test={test}
            score={avgScore}
            onRetry={() => {
              setAttempts([]);
              setPhase('idle');
              if (selectedMode === 'mixed' || selectedMode === 'random') {
                setCurrentMode(singleModes[0]);
              }
            }}
            stats={attempts.map((a, i) => ({
              label: `第${i + 1}次 (${REACTION_MODES.find((m) => m.id === a.mode)!.name})`,
              value: `${a.time}ms`,
            }))}
          />
        </div>
      )}
    </TestLayout>
  );
}
