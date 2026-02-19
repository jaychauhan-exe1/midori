export interface AnalyticsPoint {
  wpm: number;
  rawWpm: number;
  timestamp: number;
}

export interface SessionData {
  id: string;
  timestamp: number;
  stats: import("./typing").TestStats;
  recording: import("./typing").RecordingPoint[];
}
