export const getWordCountForLimit = (limit: number): number => {
  const counts: Record<number, number> = { 15: 65, 30: 125, 60: 250, 120: 500 };
  return counts[limit] || 100;
};
