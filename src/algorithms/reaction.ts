import type { ReactionMode } from '@/types';

export type { ReactionMode };

const singleModes: ReactionMode[] = ['visual', 'auditory', 'tactile'];

export function getNextMode(currentMode: ReactionMode, attemptIndex: number, isRandom: boolean): ReactionMode {
  if (isRandom) {
    return singleModes[Math.floor(Math.random() * singleModes.length)];
  }
  return singleModes[attemptIndex % singleModes.length];
}

export function calculateAverageReactionTime(attempts: { time: number; mode: ReactionMode }[]): number {
  if (attempts.length === 0) return 0;
  return Math.round(attempts.reduce((a, b) => a + b.time, 0) / attempts.length);
}
