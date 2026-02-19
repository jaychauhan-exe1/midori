import { memo } from "react";
import { Letter } from "./Letter";
import type { WordProps } from "@/src/types/typing";

export const Word = memo(({ word, typed, active, isFinished }: WordProps) => {
    const letters = word.split("");
    const extraChars = typed.length > word.length ? typed.slice(word.length).split("") : [];

    return (
        <div className="text-white!">
            <div className={`word flex text-2xl h-10 ${active ? "" : "text-foreground"}`}>
                {letters.map((char, i) => (
                    <Letter
                        key={i}
                        char={char}
                        typedChar={typed[i]}
                        missed={isFinished && typed.length <= i}
                    />
                ))}
                {extraChars.map((char, i) => (
                    <span key={i} className="text-red-500 opacity-80">{char}</span>
                ))}
            </div>
        </div>
    );
});

Word.displayName = "Word";