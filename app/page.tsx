"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { RotateCcw, ChevronRight } from "lucide-react";
import { useTyping } from "@/src/hooks/useTyping";
import { useTimer } from "@/src/hooks/useTimer";
import { useGhostCaret } from "@/src/hooks/useGhostCaret";

import { Word } from "@/src/components/typing/Word";
import { Results } from "@/src/components/typing/Results";
import { Caret } from "@/src/components/typing/Caret";
import { GhostCaret } from "@/src/components/typing/GhostCaret";
import { Timer } from "@/src/components/typing/Timer";

import { generateWordsList } from "@/src/lib/generateWords";
import { calculateSessionResults } from "@/src/lib/calculateResults";
import { getCaretPosition } from "@/src/lib/caretPosition";
import { getWordCountForLimit } from "@/src/utils/wordHelper";
import type { TestStats } from "@/src/types/typing";

export default function Home() {
  const [mode, setMode] = useState<"typing" | "results">("typing");
  const [timeLimit, setTimeLimit] = useState(30);
  const [words, setWords] = useState<string[]>([]);
  const [results, setResults] = useState<TestStats | null>(null);

  const [caretPos, setCaretPos] = useState({ top: 0, left: 0, height: 24 });
  const [containerOffset, setContainerOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const { userInput, history, activeWordIndex, handleInput, resetTyping, setHistory, setActiveWordIndex, setUserInput } = useTyping();

  const {
    timeLeft,
    startTimer,
    resetTimer,
    stopTimer,
    isActive
  } = useTimer(timeLimit, () => onTimeUp());

  const {
    ghostCaretPos,
    recordPoint,
    saveRun,
    resetGhost
  } = useGhostCaret(isActive, mode);

  const onTimeUp = useCallback(() => {
    const stats = calculateSessionResults(words, history, userInput, timeLimit);
    setResults(stats);
    saveRun(stats.wpm);
    setMode("results");
    setIsTyping(false);
  }, [words, history, userInput, timeLimit, saveRun]);

  const activeWordRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimestampRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initTest = useCallback((limit: number, sameWords?: string[]) => {
    setWords(sameWords || generateWordsList(getWordCountForLimit(limit)));
    resetTyping();
    resetTimer(limit);
    setMode("typing");
    setContainerOffset(0);
    setIsTyping(false);
    resetGhost();
    startTimestampRef.current = null;
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [resetTyping, resetTimer, resetGhost]);

  useEffect(() => initTest(timeLimit), [timeLimit, initTest]);

  // Handle backspace between words
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && userInput === "" && activeWordIndex > 0) {
      e.preventDefault();
      const prev = history[history.length - 1];
      setHistory(prevHistory => prevHistory.slice(0, -1));
      setActiveWordIndex(prevIndex => prevIndex - 1);
      setUserInput(prev);
    }
  };

  // Caret and Scroll Logic
  const updateCaret = useCallback(() => {
    if (activeWordRef.current) {
      const pos = getCaretPosition(activeWordRef.current, userInput.length);
      setCaretPos(pos);

      const top = activeWordRef.current.offsetTop;
      if (top >= 52 * 2) setContainerOffset(-(top - 52));
      else setContainerOffset(0);

      if (isActive) {
        recordPoint(pos, activeWordIndex, userInput.length);
      }
    }
  }, [userInput, activeWordIndex, isActive]);

  useEffect(() => {
    // Small delay ensures the DOM has updated refs
    const timeout = setTimeout(updateCaret, 0);
    return () => clearTimeout(timeout);
  }, [userInput, activeWordIndex, isActive, words, isFocused, updateCaret]);

  // Typing indicator for caret blink
  useEffect(() => {
    if (userInput.length > 0 || history.length > 0) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
    }
  }, [userInput, history.length]);

  return (
    <main className="flex min-h-screen p-4 max-w-6xl mx-auto font-jetbrains-mono bg-background text-foreground">
      <div className="flex flex-col items-center justify-center w-full gap-8 relative py-8">
        <div className="flex items-center justify-between w-full max-w-4xl px-4">
          <h1 className="text-2xl font-black text-primary">midori.ty</h1>
          {mode === "typing" && (
            <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-lg">
              {[15, 30, 60, 120].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeLimit(t)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${timeLimit === t
                    ? "bg-primary text-background"
                    : "text-foreground/40 hover:text-foreground"
                    }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === "results" && results ? (
          <Results stats={results} onRestart={() => initTest(timeLimit, words)} onNext={() => initTest(timeLimit)} />
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            <Timer timeLeft={timeLeft} />
            <div className="relative w-full h-[140px] overflow-hidden" onClick={() => textareaRef.current?.focus()}>
              <textarea
                ref={textareaRef}
                className="absolute opacity-0 pointer-events-none"
                value={userInput}
                onChange={(e) => {
                  if (!isActive) {
                    startTimer();
                    startTimestampRef.current = performance.now();
                  }
                  handleInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  stopTimer();
                }}
                autoFocus
              />
              <div
                style={{ transform: `translateY(${containerOffset}px)`, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                className={`flex flex-wrap gap-x-4 gap-y-3 relative transition-all duration-300 ${!isFocused && !isActive ? "blur-sm opacity-50" : ""}`}
              >
                <Caret position={caretPos} isTyping={isTyping} />
                <GhostCaret {...ghostCaretPos} />
                {words.map((w, i) => (
                  <Word
                    key={i}
                    word={w}
                    active={i === activeWordIndex}
                    typed={i === activeWordIndex ? userInput : (history[i] || "")}
                    isFinished={i < activeWordIndex}
                    wordRef={i === activeWordIndex ? activeWordRef : null}
                  />
                ))}
              </div>
              {!isFocused && !isActive && (
                <div className="absolute inset-0 z-30 flex items-center justify-center text-foreground/60 text-sm animate-pulse">
                  Click to focus
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "typing" && (
          <div className="flex gap-4">
            <button
              onClick={() => initTest(timeLimit, words)}
              className="p-4 rounded-full hover:bg-foreground/10 active:scale-95 transition-all text-foreground/30 hover:text-foreground"
              aria-label="Restart Same Test"
            >
              <RotateCcw size={22} />
            </button>
            <button
              onClick={() => initTest(timeLimit)}
              className="p-4 rounded-full hover:bg-foreground/10 active:scale-95 transition-all text-foreground/30 hover:text-foreground"
              aria-label="Next Test"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}