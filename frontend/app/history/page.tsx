"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { HistoryRecord, Verdict } from "@/types";
import { VerdictBadge } from "@/components/VerdictBadge";
import { ConfidenceBar } from "@/components/ConfidenceBar";

const FILTERS = [
  { label: "All",        value: "" },
  { label: "Scam",       value: "SCAM" },
  { label: "Suspicious", value: "SUSPICIOUS" },
  { label: "Safe",       value: "SAFE" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [records,       setRecords]       = useState<HistoryRecord[]>([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [pages,         setPages]         = useState(1);
  const [verdictFilter, setVerdictFilter] = useState("");
  const [loading,       setLoading]       = useState(false);
  const [deleting,      setDeleting]      = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getHistory(page, verdictFilter || undefined);
      setRecords(res.records);
      setTotal(res.total);
      setPages(res.pages);
    } catch {}
    setLoading(false);
  }, [page, verdictFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    setDeleting(id);
    try { await api.deleteRecord(id); await load(); }
    catch {}
    setDeleting(null);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl sm:text-3xl font-semibold text-[var(--color-brown-800)] mb-1 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          History
        </h1>
        <p className="text-sm text-[var(--color-brown-400)]">
          {total} {total === 1 ? "analysis" : "analyses"} recorded
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1"
           style={{ scrollbarWidth: "none" }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setVerdictFilter(f.value); setPage(1); }}
            className={`btn-ghost text-xs shrink-0 transition-all ${
              verdictFilter === f.value
                ? "bg-[var(--color-brown-700)] text-white border-[var(--color-brown-700)]"
                : ""
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Records */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-sm">
              <div className="skeleton h-4 w-24 rounded mb-3" />
              <div className="skeleton h-3 w-full rounded mb-2" />
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-3xl mb-3" aria-hidden>🔍</p>
          <p className="text-sm text-[var(--color-brown-400)]">
            {verdictFilter
              ? `No ${verdictFilter.toLowerCase()} records found.`
              : "No analyses yet. Run your first check on the Analyse page."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {records.map((r) => (
            <div
              key={r.id}
              className="card-sm hover:border-[var(--color-sand-200)] transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <VerdictBadge verdict={r.verdict as Verdict} size="sm" />
                  <span className="text-xs text-[var(--color-brown-400)]">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  className="text-xs text-[var(--color-brown-400)] hover:text-[var(--color-danger)] transition-colors shrink-0 disabled:opacity-40 min-h-[36px] px-1"
                  aria-label={`Delete record ${r.id}`}
                >
                  {deleting === r.id ? "Deleting…" : "Delete"}
                </button>
              </div>

              {/* Snippet */}
              <p className="text-sm text-[var(--color-brown-700)] mb-3 leading-relaxed line-clamp-2 break-words">
                {r.conversation_snippet}
              </p>

              <ConfidenceBar confidence={r.confidence} verdict={r.verdict as Verdict} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-[var(--color-brown-500)] px-2">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn-ghost disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
