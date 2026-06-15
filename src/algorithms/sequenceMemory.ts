function addRoundToSequence(sequence: number[], colorCount: number): number[] {
  return [...sequence, Math.floor(Math.random() * colorCount)];
}

function checkSequenceInput(sequence: number[], playerIndex: number, colorIndex: number): boolean {
  return sequence[playerIndex] === colorIndex;
}

function calculateSequenceScore(sequenceLength: number): number {
  return sequenceLength - 1;
}

export { addRoundToSequence, checkSequenceInput, calculateSequenceScore };
