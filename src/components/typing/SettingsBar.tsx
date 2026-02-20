"use client";

import React from "react";
import { CursorType } from "@/src/types/typing";

interface SettingsBarProps {
    timeLimit: number;
    setTimeLimit: (t: number) => void;
    cursorType: CursorType;
    setCursorType: (c: CursorType) => void;
    fontSize: number;
    setFontSize: (s: number) => void;
}

export const SettingsBar = ({
    timeLimit,
    setTimeLimit,
    cursorType,
    setCursorType,
    fontSize,
    setFontSize,
}: SettingsBarProps) => {
    return (
        <div className="flex items-center gap-6 bg-foreground/[0.03] p-1.5 px-6 rounded-2xl border border-foreground/10 shadow-md">
            {/* Cursor Type */}
            <div className="flex items-center gap-4 group">
                <label className="text-[11px] font-bold text-foreground/20 uppercase tracking-tighter">
                    Cursor type
                </label>
                <div className="flex items-center gap-0.5 bg-foreground/5 p-1 rounded-xl">
                    {(["line", "block", "box", "underline"] as CursorType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setCursorType(type)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${cursorType === type
                                ? "bg-primary text-background shadow-md shadow-primary/30"
                                : "text-foreground/30 hover:bg-foreground/10 hover:text-foreground"
                                }`}
                        >
                            {type === "line" && <div className="w-[2px] h-4 bg-current rounded-full" />}
                            {type === "block" && <div className="w-3.5 h-4.5 bg-current rounded-sm" />}
                            {type === "box" && <div className="w-3.5 h-4.5 border-2 border-current rounded-sm" />}
                            {type === "underline" && <div className="w-4.5 h-[2px] bg-current rounded-full mt-3" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-px h-8 bg-foreground/10" />

            {/* Test Length */}
            <div className="flex items-center gap-4 group">
                <label className="text-[11px] font-bold text-foreground/20 uppercase tracking-tighter group-hover:text-foreground/40 transition-colors">
                    Test length
                </label>
                <div className="flex items-center gap-0.5 bg-foreground/5 p-1 rounded-xl">
                    {[15, 30, 60, 120].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeLimit(t)}
                            className={`px-4 py-2 min-w-[42px] rounded-lg text-xs font-black transition-all duration-200 ${timeLimit === t
                                ? "bg-primary text-background shadow-md shadow-primary/30"
                                : "text-foreground/30 hover:bg-foreground/10 hover:text-foreground"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-px h-8 bg-foreground/10" />

            {/* Font Size */}
            <div className="flex items-center gap-4 flex-1 min-w-[200px] group">
                <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-foreground/20 uppercase tracking-tighter">
                        Font size
                    </label>
                    <span className="text-[10px] text-primary font-bold">{fontSize}px</span>
                </div>
                <input
                    type="range"
                    min="12"
                    max="48"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary hover:bg-foreground/20 transition-all"
                />
            </div>
        </div>
    );
};
