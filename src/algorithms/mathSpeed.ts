export interface MathQuestion {
  a: number;
  b: number;
  op: '+' | '-' | '×' | '÷';
  answer: number;
}

export interface MathConfig {
  timeLimit: number;
  ops: ('+' | '-' | '×' | '÷')[];
  maxBase: number;
}

export function generateMathQuestion(config: MathConfig): MathQuestion {
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

export function checkMathAnswer(question: MathQuestion, userAnswer: number): boolean {
  return question.answer === userAnswer;
}
