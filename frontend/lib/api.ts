import type { AnalysisResult, HistoryResponse, StatsResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  analyze: (text: string) =>
    request<AnalysisResult>("/analyze", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  getHistory: (page = 1, verdict?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (verdict) params.set("verdict", verdict);
    return request<HistoryResponse>(`/history?${params}`);
  },

  deleteRecord: (id: number) =>
    request<{ deleted: number }>(`/history/${id}`, { method: "DELETE" }),

  getStats: () => request<StatsResponse>("/stats"),
};
