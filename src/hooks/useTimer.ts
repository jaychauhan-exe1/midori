import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(initialTime: number, onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp fresh without triggering useEffect
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const startTimer = useCallback(() => setIsActive(true), []);
  const stopTimer = useCallback(() => setIsActive(false), []);

  const resetTimer = useCallback((newTime: number) => {
    setIsActive(false);
    setTimeLeft(newTime);
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsActive(false);
            onTimeUpRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  return { timeLeft, isActive, startTimer, stopTimer, resetTimer };
}
