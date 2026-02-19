export interface TestStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  missedChars: number;
  extraChars: number;
  consistency: number;
  time: number;
}

export type LetterType = {
  char: string;
  typedChar: string | undefined;
  missed?: boolean;
};
