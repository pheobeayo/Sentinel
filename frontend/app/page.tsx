"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import type { AnalysisResult } from "@/types";
import { ResultCard } from "@/components/ResultCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { SAMPLE_CONVERSATIONS } from "@/constant/samples";

export default function HomePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.analyze(text);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
  }

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
          <span className="animate-pulse-dot w-2 h-2 rounded-full bg-[var(--color-brown-400)]" />
          <span className="section-label">AI detection engine · online</span>
        </div>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[var(--color-brown-800)] mb-2 tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Detect scams instantly.
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-brown-500)] leading-relaxed">
          Paste any conversation be it a chat, SMS, or email and SENTINEL will analyse it for fraud signals.
        </p>
      </div>

      {/* Sample chips */}
      <div className="sample-chips mb-3 sm:mb-4">
        {SAMPLE_CONVERSATIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => { setText(s.text); setResult(null); setError(null); }}
            className="btn-ghost text-xs px-2.5 py-1.5 shrink-0"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Textarea wrapper — relative so hint can sit inside */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste a conversation here…"
          rows={6}
          className="input-field"
          style={{ minHeight: "140px", maxHeight: "360px" }}
          aria-label="Conversation to analyse"
        />
        {text.length > 0 && (
          <span className="absolute bottom-2.5 right-3 text-xs text-[var(--color-brown-400)] hidden sm:block pointer-events-none">
            {text.length} chars · ⌘↵
          </span>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="btn-primary w-full mt-3"
      >
        {loading ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
              aria-hidden
            />
            Analysing…
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path d="M7.5 1L1.5 4V8C1.5 12 5 15.3 7.5 16C10 15.3 13.5 12 13.5 8V4L7.5 1Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="7.5" cy="8" r="2" fill="white"/>
            </svg>
            Analyse conversation
          </>
        )}
      </button>

      {/* Character count on mobile (below button) */}
      {text.length > 0 && (
        <p className="text-xs text-[var(--color-brown-400)] mt-1.5 text-right sm:hidden">
          {text.length} characters
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger-dark)] animate-fade-in leading-relaxed">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Result */}
      {!loading && result && <ResultCard result={result} />}

      {/* Empty hint */}
      {!loading && !result && !error && (
        <p className="mt-6 text-xs text-center text-[var(--color-brown-400)]">
          Try a sample above, or paste your own conversation.
        </p>
      )}
    </div>
  );
}
