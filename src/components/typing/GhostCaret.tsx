import type { GhostCaretPosition } from "@/src/types/typing";

export const GhostCaret = ({ top, left, height, visible }: GhostCaretPosition) => {
    if (!visible) return null;
    return (
        <div
            className="absolute w-[2px] bg-primary/20 z-10 pointer-events-none"
            style={{ top, left, height }}
        />
    );
};