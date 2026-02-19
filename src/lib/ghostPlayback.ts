import type { RecordingPoint, GhostCaretPosition } from "@/src/types/typing";

export const calculateGhostPosition = (
  recording: RecordingPoint[],
  elapsed: number,
): GhostCaretPosition => {
  let prevIdx = 0;
  for (let i = 0; i < recording.length; i++) {
    if (recording[i].t <= elapsed) {
      prevIdx = i;
    } else {
      break;
    }
  }

  const p1 = recording[prevIdx];
  const p2 = recording[prevIdx + 1];

  if (!p1) return { top: 0, left: 0, height: 0, visible: false };

  let x = p1.x;
  let y = p1.y;
  let h = p1.h;

  if (p2) {
    const ratio = (elapsed - p1.t) / (p2.t - p1.t);
    x = p1.x + (p2.x - p1.x) * ratio;
    y = p1.y + (p2.y - p1.y) * ratio;
    h = p1.h + (p2.h - p1.h) * ratio;
  }

  return { top: y, left: x, height: h, visible: true };
};
