import { useState, useEffect, useRef, useCallback } from "react";
import type {
  RecordingPoint,
  GhostCaretPosition,
  CaretPosition,
} from "@/src/types/typing";
import { calculateGhostPosition } from "@/src/lib/ghostPlayback";

export function useGhostCaret(isActive: boolean, mode: "typing" | "results") {
  const [ghostCaretPos, setGhostCaretPos] = useState<GhostCaretPosition>({
    top: 0,
    left: 0,
    height: 0,
    visible: false,
  });
  const [lastRecording, setLastRecording] = useState<RecordingPoint[]>([]);

  const recordingBufferRef = useRef<RecordingPoint[]>([]);
  const maxProgressRef = useRef(-1);
  const bestWpmRef = useRef(0);
  const startTimestampRef = useRef<number | null>(null);
  const ghostStartTimestampRef = useRef<number | null>(null);

  const resetGhost = useCallback(() => {
    recordingBufferRef.current = [];
    maxProgressRef.current = -1;
    startTimestampRef.current = null;
    ghostStartTimestampRef.current = null;
    setGhostCaretPos((p) => ({ ...p, visible: false }));
  }, []);

  const recordPoint = useCallback(
    (pos: CaretPosition, activeWordIndex: number, userInputLength: number) => {
      if (!isActive) return;

      if (!startTimestampRef.current) {
        startTimestampRef.current = performance.now();
      }
      const elapsed = performance.now() - startTimestampRef.current;

      // Record progress (forward-only milestone recording)
      const currentProgress = activeWordIndex * 1000 + userInputLength;
      if (currentProgress > maxProgressRef.current) {
        maxProgressRef.current = currentProgress;
        recordingBufferRef.current.push({
          t: elapsed,
          x: pos.left,
          y: pos.top,
          h: pos.height,
        });
      }
    },
    [isActive],
  );

  const saveRun = useCallback((wpm: number) => {
    if (wpm > bestWpmRef.current) {
      bestWpmRef.current = wpm;
      setLastRecording([...recordingBufferRef.current]);
    }
  }, []);

  // Ghost Playback Loop
  useEffect(() => {
    if (!isActive || lastRecording.length === 0 || mode !== "typing") {
      ghostStartTimestampRef.current = null;
      setGhostCaretPos((p) => ({ ...p, visible: false }));
      return;
    }

    if (!ghostStartTimestampRef.current) {
      ghostStartTimestampRef.current = performance.now();
    }

    let frameId: number;
    const updateGhost = () => {
      if (!ghostStartTimestampRef.current) return;
      const elapsed = performance.now() - ghostStartTimestampRef.current;
      const pos = calculateGhostPosition(lastRecording, elapsed);
      setGhostCaretPos(pos);
      frameId = requestAnimationFrame(updateGhost);
    };

    frameId = requestAnimationFrame(updateGhost);
    return () => cancelAnimationFrame(frameId);
  }, [isActive, lastRecording, mode]);

  return {
    ghostCaretPos,
    recordPoint,
    saveRun,
    resetGhost,
  };
}
