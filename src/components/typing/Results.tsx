import { Timer, Target, BarChart3, Hash, RotateCcw, ChevronRight } from "lucide-react";
import type { TestStats } from "@/src/types/typing";

interface ResultsProps {
    stats: TestStats;
    onRestart: () => void;
    onNext: () => void;
}

export const Results = ({ stats, onRestart, onNext }: ResultsProps) => {
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
                        <span className="text-4xl font-black">{stats.correctChars}</span>
                        <span className="text-foreground/20 text-xl">/</span>
                        <span className="text-red-500/60 text-xl">{stats.incorrectChars}</span>
                    </div>
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