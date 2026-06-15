import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useScoreStore } from '@/store/useScoreStore';
import type { TestId, DifficultyLevel } from '@/types';

export type BasePhase = 'select-difficulty' | 'idle' | 'result';

export interface UseTestFlowOptions<
  TConfig = unknown,
> {
  testId: TestId;
  defaultDifficulty?: DifficultyLevel;
  difficultyConfig: Record<DifficultyLevel, TConfig>;
  onReset?: () => void;
}

export interface UseTestFlowReturn<
  TPhase extends string = string,
  TConfig = unknown,
> {
  phase: TPhase;
  setPhase: (phase: TPhase) => void;
  difficulty: DifficultyLevel | null;
  setDifficulty: (level: DifficultyLevel | null) => void;
  config: TConfig;
  isTrainingMode: boolean;
  testStartRef: React.MutableRefObject<number>;
  startTimer: () => void;
  elapsed: () => number;
  finishTest: (score: number, duration?: number, metadata?: Record<string, unknown>) => void;
  restart: () => void;
  selectDifficulty: (level: DifficultyLevel) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  startCountdown: (seconds: number) => void;
  clearCountdown: () => void;
}

export function useTestFlow<
  TPhase extends string = string,
  TConfig = unknown,
>(options: UseTestFlowOptions<TConfig>): UseTestFlowReturn<TPhase, TConfig> {
  const {
    testId,
    defaultDifficulty = 'normal',
    difficultyConfig,
    onReset,
  } = options;

  const [phase, setPhaseRaw] = useState<TPhase>('select-difficulty' as TPhase);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchParams] = useSearchParams();
  const isTrainingMode = searchParams.get('training') === '1';

  const updateScore = useScoreStore((s) => s.updateScore);
  const testStartRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  const config = difficulty ? difficultyConfig[difficulty] : difficultyConfig[defaultDifficulty];

  const setPhase = useCallback((p: TPhase) => {
    setPhaseRaw(p);
  }, []);

  useEffect(() => {
    if (isTrainingMode && phase === 'select-difficulty' && !initializedRef.current) {
      initializedRef.current = true;
      setDifficulty(defaultDifficulty);
      setPhaseRaw('idle' as TPhase);
    }
  }, [isTrainingMode, phase, defaultDifficulty]);

  const selectDifficulty = useCallback((level: DifficultyLevel) => {
    setDifficulty(level);
    setPhaseRaw('idle' as TPhase);
  }, []);

  const startTimer = useCallback(() => {
    testStartRef.current = Date.now();
  }, []);

  const elapsed = useCallback(() => {
    return Date.now() - testStartRef.current;
  }, []);

  const finishTest = useCallback(
    (score: number, customDuration?: number, metadata?: Record<string, unknown>) => {
      const duration = customDuration ?? (Date.now() - testStartRef.current);
      updateScore(testId, score, duration, metadata);
      testStartRef.current = 0;
      setPhaseRaw('result' as TPhase);
    },
    [testId, updateScore],
  );

  const restart = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onReset?.();
    if (isTrainingMode) {
      setPhaseRaw('idle' as TPhase);
    } else {
      setDifficulty(null);
      setPhaseRaw('select-difficulty' as TPhase);
    }
  }, [isTrainingMode, onReset]);

  const startCountdown = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
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

  const clearCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    phase,
    setPhase,
    difficulty,
    setDifficulty,
    config,
    isTrainingMode,
    testStartRef,
    startTimer,
    elapsed,
    finishTest,
    restart,
    selectDifficulty,
    timeLeft,
    setTimeLeft,
    startCountdown,
    clearCountdown,
  };
}
