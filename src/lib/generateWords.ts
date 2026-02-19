import wordsData from "@/data/words/english/common.json";

export const generateWordsList = (count: number): string[] => {
  const commonWords = wordsData.commonWords;
  return Array.from(
    { length: count },
    () => commonWords[Math.floor(Math.random() * commonWords.length)],
  );
};
