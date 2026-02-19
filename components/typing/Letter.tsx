import { memo } from "react";
import type { LetterProps } from "@/types/typing";

export const Letter = memo(({ char, typedChar, missed }: LetterProps) => {
    let color = "text-foreground/30";
    let decoration = "";

    if (missed) {
        color = "text-red-500/60";
        decoration = "underline decoration-red-500/50 underline-offset-4";
    } else if (typedChar !== undefined) {
        color = typedChar === char ? "text-foreground" : "text-red-500";
    }

    return (
        <span className={`letter transition-colors duration-75 ${color} ${decoration}`}>
            {char}
        </span>
    );
});

Letter.displayName = "Letter";
