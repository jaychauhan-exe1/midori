import { useState, useCallback } from "react";

export function useTyping() {
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");

  const handleInput = useCallback(
    (value: string) => {
      if (value.endsWith(" ")) {
        if (userInput.length > 0) {
          // Space pressed: Save current word to history and reset input
          setHistory((prev) => [...prev, userInput]);
          setActiveWordIndex((prev) => prev + 1);
          setUserInput("");
        }
      } else {
        setUserInput(value);
      }
    },
    [userInput],
  );

  return { userInput, history, activeWordIndex, handleInput };
}
