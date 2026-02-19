import { useState, useCallback } from "react";

export function useTyping() {
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");

  const handleInput = useCallback(
    (value: string) => {
      // Prevent long strings without spaces
      if (value.length > 20 && !value.endsWith(" ")) return;

      if (value.endsWith(" ")) {
        if (userInput.length > 0) {
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

  const resetTyping = useCallback(() => {
    setActiveWordIndex(0);
    setHistory([]);
    setUserInput("");
  }, []);

  return {
    userInput,
    history,
    activeWordIndex,
    setUserInput,
    handleInput,
    resetTyping,
    setHistory,
    setActiveWordIndex,
  };
}
