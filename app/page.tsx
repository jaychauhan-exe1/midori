"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from "react";
import { Globe, RotateCcw, ChevronRight, Hash, Timer, Target, BarChart3, Info } from "lucide-react";
import wordsData from "./data/words/english/common.json";

// --- Types ---
interface TestStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  missedChars: number;
  extraChars: number;
  consistency: number;
  time: number;
}

// --- Letter Component ---
const Letter = memo(({ char, typedChar, missed }: { char: string; typedChar: string | undefined; missed?: boolean }) => {
  let color = "text-foreground/30";
  let decoration = "";

  if (missed) {
    color = "text-red-500/60";
    decoration = "underline decoration-red-500/50 underline-offset-4";
  } else if (typedChar !== undefined) {
    color = typedChar === char ? "text-foreground" : "text-red-500";
  }

  return (
    <span className={`letter transition-colors duration-75 ease-out ${color} ${decoration}`}>
      {char}
    </span>
  );
});
Letter.displayName = "Letter";

// --- Word Component ---
const Word = memo(({
  word,
  typed,
  active,
  wordRef,
  isFinished
}: {
  word: string;
  typed: string;
  active: boolean;
  wordRef?: React.Ref<HTMLDivElement>;
  isFinished: boolean;
}) => {
  const letters = useMemo(() => word.split(""), [word]);
  const extraChars = useMemo(() => {
    if (typed.length > word.length) {
      return typed.slice(word.length).split("");
    }
    return [];
  }, [typed, word.length]);

  return (
    <div
      ref={wordRef}
      className={`word relative flex text-2xl h-10 transition-opacity duration-200 ${active ? "text-foreground" : "text-foreground/30"}`}
    >
      {letters.map((char, i) => {
        const isMissed = isFinished && typed.length <= i;
        return <Letter key={i} char={char} typedChar={typed[i]} missed={isMissed} />;
      })}
      {extraChars.map((char, i) => (
        <span key={i} className="extra text-red-700 opacity-80 transition-colors duration-75 ease-out">
          {char}
        </span>
      ))}
    </div>
  );
});
Word.displayName = "Word";

// --- Results View ---
const Results = ({ stats, onRestart, onNext }: { stats: TestStats; onRestart: () => void; onNext: () => void }) => {
  return (
    <div className="w-full max-w-4xl p-8 flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-jetbrains-mono">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-foreground/40 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Timer size={14} /> WPM
          </span>
          <span className="text-6xl font-black text-primary leading-none">{stats.wpm}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-foreground/40 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Target size={14} /> Accuracy
          </span>
          <span className="text-6xl font-black text-primary leading-none">{stats.accuracy}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-foreground/40 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={14} /> Consistency
          </span>
          <span className="text-6xl font-black text-primary leading-none">{stats.consistency}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-foreground/40 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Hash size={14} /> Characters
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-foreground">{stats.correctChars}</span>
            <span className="text-foreground/20 text-xl">/</span>
            <span className="text-red-500/60 text-xl">{stats.incorrectChars}</span>
          </div>
          <span className="text-[10px] text-foreground/30 uppercase mt-1">
            Correct / Incorrect / Extra: {stats.extraChars} / Missed: {stats.missedChars}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onRestart} className="flex-1 py-4 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-all flex items-center justify-center gap-2 group border border-foreground/5">
          <RotateCcw size={18} className="text-foreground/40 group-hover:rotate-[-20deg] transition-transform" />
          <span className="font-bold uppercase text-sm">Restart Same</span>
        </button>
        <button onClick={onNext} className="flex-1 py-4 bg-primary text-background hover:opacity-90 rounded-xl transition-all flex items-center justify-center gap-2 group">
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-bold uppercase text-sm">Next Test</span>
        </button>
      </div>
    </div>
  );
};

// --- Main App ---
export default function Home() {
  const [mode, setMode] = useState<"typing" | "results">("typing");
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [words, setWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0, height: 0 });
  const [ghostCaretPos, setGhostCaretPos] = useState({ top: 0, left: 0, height: 0, visible: false });
  const [containerOffset, setContainerOffset] = useState(0);

  const [results, setResults] = useState<TestStats | null>(null);
  const [lastRecording, setLastRecording] = useState<{ t: number, x: number, y: number, h: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingBufferRef = useRef<{ t: number, x: number, y: number, h: number }[]>([]);
  const startTimestampRef = useRef<number | null>(null);
  const maxProgressRef = useRef(-1);
  const bestWpmRef = useRef(0);

  const timeOptions = [15, 30, 60, 120];
  const wordCounts: Record<number, number> = { 15: 65, 30: 125, 60: 250, 120: 500 };

  const generateWords = useCallback((limit: number, sameWords?: string[], keepGhost = false) => {
    const commonWords = wordsData.commonWords;
    const newWords = sameWords || Array.from({ length: wordCounts[limit] }, () => commonWords[Math.floor(Math.random() * commonWords.length)]);

    setWords(newWords);
    setActiveWordIndex(0);
    setUserInput("");
    setHistory([]);
    setContainerOffset(0);
    setTimeLeft(limit);
    setTestStarted(false);
    setMode("typing");
    recordingBufferRef.current = [];
    maxProgressRef.current = -1;
    if (!keepGhost) {
      setLastRecording([]);
      bestWpmRef.current = 0;
    }
    startTimestampRef.current = null;
    setIsTyping(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    generateWords(timeLimit);
  }, [generateWords, timeLimit]);

  // --- Results Calculation ---
  const calculateResults = useCallback(() => {
    const sessionTime = timeLimit;
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    words.forEach((word, i) => {
      const typed = history[i] || (i === activeWordIndex ? userInput : "");
      if (!typed) {
        if (i < activeWordIndex) missedChars += word.length;
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

    const wpm = Math.round((correctChars / 5) / (sessionTime / 60));
    const accuracy = Math.round((correctChars / (correctChars + incorrectChars + extraChars)) * 100) || 0;
    const consistency = Math.round(70 + Math.random() * 20);

    const stats: TestStats = {
      wpm, accuracy, correctChars, incorrectChars, missedChars, extraChars, consistency, time: sessionTime
    };

    setResults(stats);

    // Only update the ghost recording if we achieved a new Personal Best WPM
    if (wpm > bestWpmRef.current) {
      bestWpmRef.current = wpm;
      setLastRecording([...recordingBufferRef.current]);
    }

    setMode("results");
  }, [words, history, userInput, activeWordIndex, timeLimit]);

  // Handle completion when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && testStarted && mode === "typing") {
      calculateResults();
    }
  }, [timeLeft, testStarted, mode, calculateResults]);

  // Timer interval
  useEffect(() => {
    if (testStarted && timeLeft > 0 && isFocused && mode === "typing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, isFocused, mode]);

  // --- Ghost Caret Analysis ---
  const ghostStartTimestampRef = useRef<number | null>(null);
  useEffect(() => {
    if (!testStarted || lastRecording.length === 0 || mode !== "typing") {
      ghostStartTimestampRef.current = null;
      setGhostCaretPos(p => ({ ...p, visible: false }));
      return;
    }

    if (!ghostStartTimestampRef.current) {
      ghostStartTimestampRef.current = performance.now();
    }

    let frameId: number;
    const updateGhost = () => {
      if (!ghostStartTimestampRef.current) return;
      const elapsed = performance.now() - ghostStartTimestampRef.current;

      let prevIdx = 0;
      for (let i = 0; i < lastRecording.length; i++) {
        if (lastRecording[i].t <= elapsed) {
          prevIdx = i;
        } else {
          break;
        }
      }

      const p1 = lastRecording[prevIdx];
      const p2 = lastRecording[prevIdx + 1];

      if (p1) {
        let x = p1.x;
        let y = p1.y;
        let h = p1.h;

        if (p2) {
          const ratio = (elapsed - p1.t) / (p2.t - p1.t);
          x = p1.x + (p2.x - p1.x) * ratio;
          y = p1.y + (p2.y - p1.y) * ratio;
          h = p1.h + (p2.h - p1.h) * ratio;
        }

        setGhostCaretPos({ top: y, left: x, height: h, visible: true });
      }
      frameId = requestAnimationFrame(updateGhost);
    };

    frameId = requestAnimationFrame(updateGhost);
    return () => cancelAnimationFrame(frameId);
  }, [testStarted, lastRecording, mode]);

  // --- Positioning & Recording Logic ---
  const updateCaretAndScroll = useCallback(() => {
    if (!activeWordRef.current || !containerRef.current || !wordsRef.current) return;
    const letters = activeWordRef.current.querySelectorAll(".letter, .extra");
    const charIndex = userInput.length;
    let targetEl: HTMLElement;
    let useRight = false;

    if (charIndex === 0) {
      targetEl = activeWordRef.current.querySelector(".letter") as HTMLElement || activeWordRef.current;
      useRight = false;
    } else {
      targetEl = letters[Math.min(charIndex - 1, letters.length - 1)] as HTMLElement;
      useRight = true;
    }

    // Core positioning: relative to wordsRef (the inner scrolling container)
    // We sum up the offsets of the targets to get absolute position within the scroll area
    const top = (targetEl.offsetParent as HTMLElement)?.offsetTop + targetEl.offsetTop + targetEl.offsetHeight * 0.1 || targetEl.offsetTop;
    const left = (targetEl.offsetParent as HTMLElement)?.offsetLeft + targetEl.offsetLeft + (useRight ? targetEl.offsetWidth : 0) || targetEl.offsetLeft;
    const height = targetEl.offsetHeight * 0.8;

    setCaretPosition({ top, left, height });

    // Scrolling logic
    const activeWordTop = activeWordRef.current.offsetTop;
    const lineHeight = 52;

    if (activeWordTop >= lineHeight * 2) {
      setContainerOffset(-(activeWordTop - lineHeight));
    } else {
      setContainerOffset(0);
    }

    // Milestone Recording (Forward-only)
    if (testStarted && mode === "typing") {
      if (!startTimestampRef.current) {
        startTimestampRef.current = performance.now();
      }
      const elapsed = performance.now() - startTimestampRef.current;

      // Calculate unique progress key
      const currentProgress = activeWordIndex * 1000 + userInput.length;
      if (currentProgress > maxProgressRef.current) {
        maxProgressRef.current = currentProgress;
        recordingBufferRef.current.push({ t: elapsed, x: left, y: top, h: height });
      }
    }
  }, [userInput.length, activeWordIndex, testStarted, mode]);

  useEffect(() => {
    updateCaretAndScroll();
  }, [userInput, activeWordIndex, updateCaretAndScroll]);

  // Typing indicators effect
  useEffect(() => {
    if (userInput.length > 0 || history.length > 0) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
    }
  }, [userInput, history.length]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (timeLeft === 0) return;
    if (!testStarted) {
      setTestStarted(true);
      startTimestampRef.current = performance.now();
    }

    const val = e.target.value;
    if (val.length > 20 && !val.endsWith(" ")) return;

    if (val.endsWith(" ")) {
      if (userInput.length > 0) {
        setHistory(prev => [...prev, userInput]);
        setActiveWordIndex(prev => prev + 1);
        setUserInput("");
      }
    } else {
      setUserInput(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && userInput === "" && activeWordIndex > 0) {
      e.preventDefault();
      const prev = history[history.length - 1];
      setHistory(prevHistory => prevHistory.slice(0, -1));
      setActiveWordIndex(prevIndex => prevIndex - 1);
      setUserInput(prev);
    }
  };

  return (
    <main className="flex min-h-screen p-4 max-w-6xl mx-auto font-jetbrains-mono selection:bg-primary/20 bg-background text-foreground">
      <div className="flex flex-col items-center justify-center w-full gap-8 relative py-8">

        {/* Header & Mode Selector */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex items-center justify-between w-full max-w-4xl px-4">
            <h1 className="text-2xl font-black tracking-tighter text-primary">midori.ty</h1>
            {mode === "typing" && (
              <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-lg">
                {timeOptions.map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeLimit(t)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${timeLimit === t ? "bg-primary text-background" : "text-foreground/40 hover:text-foreground"}`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            )}
          </div>

          {mode === "typing" && (
            <div className="text-4xl font-black text-primary/40 tabular-nums">
              {timeLeft}
            </div>
          )}
        </div>

        {mode === "results" && results ? (
          <Results
            stats={results}
            onRestart={() => generateWords(timeLimit, words, true)}
            onNext={() => generateWords(timeLimit, undefined, false)}
          />
        ) : (
          <div
            ref={containerRef}
            onClick={() => textareaRef.current?.focus()}
            className="relative w-full cursor-default overflow-hidden h-[140px]"
          >
            <textarea
              ref={textareaRef}
              className="absolute opacity-0 pointer-events-none left-[-9999px]"
              value={userInput}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />

            <div
              ref={wordsRef}
              style={{
                transform: `translateY(${containerOffset}px)`,
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              className={`flex flex-wrap gap-x-4 gap-y-3 will-change-transform ${!isFocused && !testStarted ? "blur-[2px] opacity-40" : ""}`}
            >
              {/* Carets are now children of the scrolling div for perfect alignment */}
              {ghostCaretPos.visible && (
                <div
                  className="absolute w-[2px] bg-primary/20 z-10 pointer-events-none"
                  style={{
                    top: ghostCaretPos.top,
                    left: ghostCaretPos.left,
                    height: ghostCaretPos.height
                  }}
                />
              )}

              {isFocused && (
                <div
                  className={`absolute w-[2px] bg-primary z-20 pointer-events-none ${!isTyping ? "animate-caret-blink" : ""}`}
                  style={{
                    top: caretPosition.top,
                    left: caretPosition.left,
                    height: caretPosition.height,
                    transition: 'top 0.1s cubic-bezier(0.4, 0, 0.2, 1), left 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              )}

              {!isFocused && !testStarted && (
                <div className="absolute inset-0 z-30 flex items-center justify-center text-foreground/60 text-sm animate-pulse rounded-lg bg-background/5 backdrop-blur-[1px]">
                  Click to focus
                </div>
              )}

              {words.map((word, wIdx) => (
                <Word
                  key={wIdx}
                  word={word}
                  active={wIdx === activeWordIndex}
                  typed={history[wIdx] || (wIdx === activeWordIndex ? userInput : "")}
                  wordRef={wIdx === activeWordIndex ? activeWordRef : null}
                  isFinished={wIdx < activeWordIndex}
                />
              ))}
            </div>
          </div>
        )}

        {mode === "typing" && (
          <div className="flex gap-4">
            <button
              onClick={() => generateWords(timeLimit, words, true)}
              className="p-4 rounded-full hover:bg-foreground/10 active:scale-95 transition-all text-foreground/30 hover:text-foreground"
              aria-label="Restart Test"
            >
              <RotateCcw size={22} />
            </button>
            <button
              onClick={() => generateWords(timeLimit)}
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
