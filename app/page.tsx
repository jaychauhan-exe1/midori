"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import wordsData from "@/data/words/english/common.json";
import { Word } from "@/src/components/typing/Word";
import { useTyping } from "@/src/hooks/useTyping";

export default function Home() {
  const { userInput, history, activeWordIndex, handleInput } = useTyping();
  const [paragraph, setParagraph] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate words only on the client to avoid hydration mismatch
  useEffect(() => {
    const generated = Array.from({ length: 50 }, () =>
      wordsData.commonWords[Math.round(Math.random() * (wordsData.commonWords.length - 1))]
    );
    setParagraph(generated);
  }, []);

  // Ensure the input is focused when clicking anywhere on the screen
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <main
      className="flex min-h-screen p-8 max-w-4xl mx-auto font-mono cursor-text"
      onClick={handleContainerClick}
    >
      <div className="h-[120px] overflow-y-hidden">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {paragraph.map((word, i) => (
            <Word
              key={i}
              word={word}
              active={i === activeWordIndex}
              typed={i === activeWordIndex ? userInput : (history[i] || "")}
              isFinished={i < activeWordIndex}
            />
          ))}
        </div>
        <textarea
          ref={inputRef}
          autoFocus
          value={userInput}
          onChange={(e) => handleInput(e.target.value)}
          className="absolute opacity-0 pointer-events-none"
        />
      </div>
    </main>
  );
}