export type Verdict = "SCAM" | "SUSPICIOUS" | "SAFE";

export interface AnalysisResult {
  id: number;
  verdict: Verdict;
  confidence: number;
  flags: string[];
  summary: string;
  created_at: string;
}

export interface HistoryRecord {
  id: number;
  conversation_snippet: string;
  verdict: Verdict;
  confidence: number;
  flags: string[];
  summary: string;
  created_at: string;
}

export interface HistoryResponse {
  records: HistoryRecord[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

export interface StatsResponse {
  total_analyzed: number;
  scam_count: number;
  suspicious_count: number;
  safe_count: number;
  scam_detection_rate: number;
  average_confidence: number;
}
