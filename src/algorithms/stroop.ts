export interface StroopQuestion {
  textColor: number;
  displayColor: number;
}

export function generateStroopQuestion(colorCount: number): StroopQuestion {
  const textColor = Math.floor(Math.random() * colorCount);
  let displayColor = Math.floor(Math.random() * colorCount);
  while (displayColor === textColor) {
    displayColor = Math.floor(Math.random() * colorCount);
  }
  return { textColor, displayColor };
}

export function checkStroopAnswer(question: StroopQuestion, selectedColorId: number): boolean {
  return question.displayColor === selectedColorId;
}

export function getStroopGridCols(colorCount: number): string {
  if (colorCount <= 3) return 'grid-cols-3';
  if (colorCount <= 4) return 'grid-cols-4';
  return 'grid-cols-3';
}

export function calculateStroopAccuracy(correctCount: number, wrongCount: number): number {
  const total = correctCount + wrongCount;
  if (total === 0) return 0;
  return Math.round((correctCount / total) * 100);
}
