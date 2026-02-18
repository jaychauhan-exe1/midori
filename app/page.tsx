import { Globe } from "lucide-react";
import words from "./data/words/english/common.json";
export default function Home() {
  const randomIndex = Math.floor(Math.random() * words.commonWords.length);
  let paragraph = [];
  for (let i = 0; i < 40; i++) {
    const word =
      words.commonWords[Math.floor(Math.random() * words.commonWords.length)];
    paragraph.push(word);
  }
  console.log(paragraph);
  return (
    <main className="flex min-h-screen p-4 max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center w-full gap-8">
        <h1 className="text-4xl font-bold">Midori Type</h1>
        <h4 className="flex items-center justify-between gap-2 uppercase text-sm">
          <Globe size={12} /> English
        </h4>
        <div className="flex flex-wrap gap-2">
          {paragraph.map((word, index) => (
            <span
              key={index}
              className="text-lg tracking-widest text-foreground/40 "
            >
              {word + " "}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
