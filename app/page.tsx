import { Globe } from "lucide-react";
import words from "@/data/words/english/common.json";
import { Letter } from "@/components/typing/Letter";


export default function Home() {
  const paragraph = Array.from({ length: 100 }, () =>
    words.commonWords[Math.floor(Math.random() * words.commonWords.length)]
  );

  return (
    <main className="flex min-h-screen p-4 max-w-6xl mx-auto">
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <h1 className="text-4xl font-bold">Midori</h1>

        <h4 className="flex items-center gap-2 text-sm uppercase">
          <Globe size={14} /> English
        </h4>
        <div className="flex flex-wrap gap-2 h-[120px] overflow-y-hidden">
          {paragraph.map((word, i) => (
            <div key={i} className="flex text-2xl">
              {word.split("").map((char, j) => (
                <Letter key={j} char={char} />
              ))}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
