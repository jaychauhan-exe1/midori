import type { TestStats } from "@/src/types/typing";

export const calculateSessionResults = (
  words: string[],
  history: string[],
  userInput: string,
  timeLimit: number,
): TestStats => {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;

  words.forEach((word, i) => {
    const typed = history[i] || (i === history.length ? userInput : "");
    if (!typed) {
      if (i < history.length) missedChars += word.length;
      return;
    }

    for (let j = 0; j < Math.max(word.length, typed.length); j++) {
      if (j < word.length) {
        if (typed[j] === undefined) missedChars++;
        else if (typed[j] === word[j]) correctChars++;
        else incorrectChars++;
      } else {
        extraChars++;
      }
    }
  });

  return {
    wpm: Math.round(correctChars / 5 / (timeLimit / 60)),
    accuracy:
      Math.round(
        (correctChars / (correctChars + incorrectChars + extraChars)) * 100,
      ) || 0,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    consistency: Math.round(70 + Math.random() * 20),
    time: timeLimit,
  };
};
