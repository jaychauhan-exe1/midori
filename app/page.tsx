"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useTyping } from "@/src/hooks/useTyping";
import { useTimer } from "@/src/hooks/useTimer";

// Components
import { Word } from "@/src/components/typing/Word";
import { Results } from "@/src/components/typing/Results";
import { Caret } from "@/src/components/typing/Caret";
import { GhostCaret } from "@/src/components/typing/GhostCaret";
import { Timer } from "@/src/components/typing/Timer";

// Libs/Utils
import { generateWordsList } from "@/src/lib/generateWords";
import { calculateSessionResults } from "@/src/lib/calculateResults";
import { getCaretPosition } from "@/src/lib/caretPosition";
import { calculateGhostPosition } from "@/src/lib/ghostPlayback";
import { getWordCountForLimit } from "@/src/utils/wordHelper";
import type { TestStats, RecordingPoint, GhostCaretPosition } from "@/src/types/typing";

export default function Home() {
  const [mode, setMode] = useState<"typing" | "results">("typing");
  const [timeLimit, setTimeLimit] = useState(30);
  const [words, setWords] = useState<string[]>([]);
  const [results, setResults] = useState<TestStats | null>(null);

  const [caretPos, setCaretPos] = useState({ top: 0, left: 0, height: 0 });
  const [ghostCaretPos, setGhostCaretPos] = useState<GhostCaretPosition>({ top: 0, left: 0, height: 0, visible: false });
  const [containerOffset, setContainerOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [lastRecording, setLastRecording] = useState<RecordingPoint[]>([]);

  const { userInput, history, activeWordIndex, handleInput, resetTyping, setHistory, setActiveWordIndex, setUserInput } = useTyping();

  const onTimeUp = useCallback(() => {
    const stats = calculateSessionResults(words, history, userInput, timeLimit);
    setResults(stats);
    setMode("results");
    setIsTyping(false);
  }, [words, history, userInput, timeLimit]);

  const { timeLeft, startTimer, resetTimer, stopTimer, isActive } = useTimer(timeLimit, onTimeUp);

  const activeWordRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimestampRef = useRef<number | null>(null);
  const recordingBufferRef = useRef<RecordingPoint[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initTest = useCallback((limit: number, sameWords?: string[]) => {
    setWords(sameWords || generateWordsList(getWordCountForLimit(limit)));
    resetTyping();
    resetTimer(limit);
    setMode("typing");
    setContainerOffset(0);
    setIsTyping(false);
    recordingBufferRef.current = [];
    startTimestampRef.current = null;
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [resetTyping, resetTimer]);

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
  useEffect(() => {
    const pos = getCaretPosition(activeWordRef.current, userInput.length);
    setCaretPos(pos);

    if (activeWordRef.current) {
      const top = activeWordRef.current.offsetTop;
      if (top >= 52 * 2) setContainerOffset(-(top - 52));
      else setContainerOffset(0);
    }

    if (isActive) {
      const elapsed = performance.now() - (startTimestampRef.current || performance.now());
      recordingBufferRef.current.push({ t: elapsed, x: pos.left, y: pos.top, h: pos.height });
    }
  }, [userInput, activeWordIndex, isActive]);

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
        <h1 className="text-2xl font-black text-primary">midori.ty</h1>

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
                  stopTimer(); // Pause timer on blur
                }}
                autoFocus
              />
              <div
                style={{ transform: `translateY(${containerOffset}px)`, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                className={`flex flex-wrap gap-x-4 gap-y-3 relative transition-all duration-300 ${!isFocused && !isActive ? "blur-sm opacity-50" : ""}`}
              >
                <Caret position={caretPos} isTyping={isTyping} />
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
      </div>
    </main>
  );
}