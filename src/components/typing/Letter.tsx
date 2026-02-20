import { memo } from "react";
import type { LetterProps } from "@/src/types/typing";

export const Letter = memo(({ char, typedChar, missed, isCurrentWord }: LetterProps) => {
    let color = "text-foreground/30";
    let decoration = "";

    if (missed) {
        color = "text-red-500/60";
        decoration = "underline decoration-red-500/50 underline-offset-4";
    } else if (typedChar !== undefined) {
        if (typedChar === char) {
            color = isCurrentWord ? "text-primary" : "text-foreground";
        } else {
            color = "text-red-500";
        }
    }

    const isPrimary = color === "text-primary";
    const isError = color === "text-red-500" || color === "text-red-500/60";
    const isSuccess = color === "text-foreground";

    let glowClass = "";
    if (isPrimary) glowClass = "typing-glow";
    else if (isError) glowClass = "error-glow";
    else if (isSuccess) glowClass = "success-glow";

    return (
        <span
            className={`letter transition-all duration-300 ease-in-out ${color} ${decoration} ${glowClass}`}
        >
            {char}
        </span>
    );
});

Letter.displayName = "Letter";
