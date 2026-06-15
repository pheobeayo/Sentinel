import type { AnalysisResult, Verdict } from "@/types";
import { VerdictBadge } from "./VerdictBadge";
import { ConfidenceBar } from "./ConfidenceBar";

interface Props { result: AnalysisResult }

const VERDICT_ICON: Record<Verdict, React.ReactNode> = {
  SCAM: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path d="M10 2L2 5.5V10C2 14.4 5.6 18.3 10 19.5C14.4 18.3 18 14.4 18 10V5.5L10 2Z" stroke="#dc2626" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M10 7V10M10 13H10.01" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  SUSPICIOUS: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path d="M10 2L2 5.5V10C2 14.4 5.6 18.3 10 19.5C14.4 18.3 18 14.4 18 10V5.5L10 2Z" stroke="#d97706" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M10 7V10M10 13H10.01" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  SAFE: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path d="M10 2L2 5.5V10C2 14.4 5.6 18.3 10 19.5C14.4 18.3 18 14.4 18 10V5.5L10 2Z" stroke="#16a34a" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M6.5 10L8.8 12.3L13.5 7.5" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const ADVISORY: Record<Verdict, React.ReactNode> = {
  SCAM: <><strong>Warning:</strong> Do not share personal details, send money, or click any links.</>,
  SUSPICIOUS: <><strong>Caution:</strong> Verify the sender&apos;s identity before responding.</>,
  SAFE: <><strong>All clear:</strong> No scam patterns found. This conversation appears legitimate.</>,
};

const ADVISORY_CLASS: Record<Verdict, string> = {
  SCAM:       "bg-[var(--color-danger-light)] border border-red-200 text-[var(--color-danger-dark)]",
  SUSPICIOUS: "bg-[var(--color-warning-light)] border border-amber-200 text-[var(--color-warning-dark)]",
  SAFE:       "bg-[var(--color-safe-light)] border border-green-200 text-[var(--color-safe-dark)]",
};

export function ResultCard({ result }: Props) {
  return (
    <div className="card animate-slide-up mt-5 sm:mt-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5">{VERDICT_ICON[result.verdict]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <VerdictBadge verdict={result.verdict} />
            <span className="text-xs text-[var(--color-brown-400)]">#{result.id}</span>
          </div>
          <p className="text-sm text-[var(--color-brown-600)] leading-relaxed break-words">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div className="mb-4">
        <ConfidenceBar confidence={result.confidence} verdict={result.verdict} />
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="mb-4 pt-4 border-t border-[var(--color-cream-200)]">
          <p className="section-label mb-2.5">Red flags</p>
          <ul className="space-y-2">
            {result.flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-brown-700)]">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-brown-300)] shrink-0" />
                <span className="break-words min-w-0">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Advisory */}
      <div className={`rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm leading-relaxed ${ADVISORY_CLASS[result.verdict]}`}>
        {ADVISORY[result.verdict]}
      </div>
    </div>
  );
}
