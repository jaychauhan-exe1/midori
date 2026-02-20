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

export interface LetterProps {
  char: string;
  typedChar?: string;
  missed?: boolean;
  isCurrentWord?: boolean;
}

export interface WordProps {
  word: string;
  typed: string;
  active: boolean;
  wordRef?: React.Ref<HTMLDivElement>;
  isFinished: boolean;
}

export interface CaretPosition {
  top: number;
  left: number;
  height: number;
}

export interface GhostCaretPosition extends CaretPosition {
  visible: boolean;
}

export interface RecordingPoint {
  t: number;
  x: number;
  y: number;
  h: number;
}

export type Mode = "typing" | "results";
