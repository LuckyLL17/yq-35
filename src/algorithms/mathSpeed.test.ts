import { describe, it, expect } from 'vitest';
import { generateMathQuestion, checkMathAnswer, MathConfig, MathQuestion } from './mathSpeed';

const plusConfig: MathConfig = { timeLimit: 60, ops: ['+'], maxBase: 50 };
const minusConfig: MathConfig = { timeLimit: 60, ops: ['-'], maxBase: 50 };
const multiplyConfig: MathConfig = { timeLimit: 60, ops: ['×'], maxBase: 50 };
const divideConfig: MathConfig = { timeLimit: 60, ops: ['÷'], maxBase: 50 };
const mixedConfig: MathConfig = { timeLimit: 60, ops: ['+', '-', '×', '÷'], maxBase: 50 };

describe('generateMathQuestion', () => {
  it('with only "+" ops returns correct answer (a + b)', () => {
    const q = generateMathQuestion(plusConfig);
    expect(q.op).toBe('+');
    expect(q.answer).toBe(q.a + q.b);
  });

  it('with only "-" ops returns correct answer (a - b), and a >= b', () => {
    const q = generateMathQuestion(minusConfig);
    expect(q.op).toBe('-');
    expect(q.answer).toBe(q.a - q.b);
    expect(q.a).toBeGreaterThanOrEqual(q.b);
  });

  it('with only "×" ops returns correct answer (a * b)', () => {
    const q = generateMathQuestion(multiplyConfig);
    expect(q.op).toBe('×');
    expect(q.answer).toBe(q.a * q.b);
  });

  it('with only "÷" ops returns correct answer (a / b), and a is divisible by b', () => {
    const q = generateMathQuestion(divideConfig);
    expect(q.op).toBe('÷');
    expect(q.answer).toBe(q.a / q.b);
    expect(q.a % q.b).toBe(0);
  });

  it('with mixed ops returns one of the configured ops', () => {
    const q = generateMathQuestion(mixedConfig);
    expect(mixedConfig.ops).toContain(q.op);
  });

  it('"+" answer correctness', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateMathQuestion(plusConfig);
      expect(q.answer).toBe(q.a + q.b);
    }
  });

  it('"-" answer is non-negative', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateMathQuestion(minusConfig);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('"×" a and b are between 2-13', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateMathQuestion(multiplyConfig);
      expect(q.a).toBeGreaterThanOrEqual(2);
      expect(q.a).toBeLessThanOrEqual(13);
      expect(q.b).toBeGreaterThanOrEqual(2);
      expect(q.b).toBeLessThanOrEqual(13);
    }
  });

  it('"÷" b is between 2-12, answer is >= 1', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateMathQuestion(divideConfig);
      expect(q.b).toBeGreaterThanOrEqual(2);
      expect(q.b).toBeLessThanOrEqual(12);
      expect(q.answer).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('checkMathAnswer', () => {
  it('with correct answer returns true', () => {
    const question: MathQuestion = { a: 3, b: 5, op: '+', answer: 8 };
    expect(checkMathAnswer(question, 8)).toBe(true);
  });

  it('with wrong answer returns false', () => {
    const question: MathQuestion = { a: 3, b: 5, op: '+', answer: 8 };
    expect(checkMathAnswer(question, 7)).toBe(false);
  });
});
