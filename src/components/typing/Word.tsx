import { memo, useMemo } from "react";
import { Letter } from "./Letter";
import type { WordProps } from "@/src/types/typing";

export const Word = memo(({ word, typed, active, wordRef, isFinished }: WordProps) => {
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
            className={`word relative flex transition-all duration-300 ease-in-out ${active ? "text-foreground" : "text-foreground/30"
                }`}
        >
            {letters.map((char, i) => (
                <Letter
                    key={i}
                    char={char}
                    typedChar={typed[i]}
                    missed={isFinished && typed.length <= i}
                    isCurrentWord={active}
                />
            ))}
            {extraChars.map((char, i) => (
                <span key={i} className="extra text-red-700 opacity-80 transition-colors duration-75">
                    {char}
                </span>
            ))}
        </div>
    );
});

Word.displayName = "Word";