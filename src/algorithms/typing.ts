function calculateCorrectChars(input: string, target: string): number {
  return input.split('').filter((c, i) => c === target[i]).length;
}

function calculateWPM(correctChars: number): number {
  return Math.floor(correctChars / 5);
}

function calculateAccuracy(correctChars: number, totalInputChars: number): number {
  if (totalInputChars === 0) return 0;
  return Math.round((correctChars / totalInputChars) * 100);
}

export { calculateCorrectChars, calculateWPM, calculateAccuracy };
