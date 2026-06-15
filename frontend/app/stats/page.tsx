"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { StatsResponse } from "@/types";
import { StatCard } from "@/components/StatCard";

function DistBar({
  label, count, total, color,
}: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5 gap-2">
        <span className="text-[var(--color-brown-600)] shrink-0">{label}</span>
        <span className="text-[var(--color-brown-400)] text-right">
          {count} · {pct.toFixed(1)}%
        </span>
      </div>
      <div className="conf-bar">
        <div className="conf-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [stats,   setStats]   = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-36 rounded mb-2" />
        <div className="skeleton h-4 w-52 rounded mb-7" />
        <div className="stat-grid mb-6">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl sm:text-3xl font-semibold text-[var(--color-brown-800)] mb-1 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-[var(--color-brown-400)]">System performance overview</p>
      </div>

      {/* Metric grid — 2-col mobile, 3-col tablet+ */}
      <div className="stat-grid mb-6">
        <StatCard label="Total analysed"  value={stats.total_analyzed} accent />
        <StatCard
          label="Scams detected"
          value={stats.scam_count}
          sub={`${stats.scam_detection_rate.toFixed(1)}% of total`}
        />
        <StatCard label="Suspicious"       value={stats.suspicious_count} />
        <StatCard label="Safe"             value={stats.safe_count} />
        <StatCard label="Avg confidence"   value={`${stats.average_confidence.toFixed(1)}%`} />
        <StatCard label="Scam rate"        value={`${stats.scam_detection_rate.toFixed(1)}%`} />
      </div>

      {/* Distribution */}
      <div className="card mb-4">
        <p className="section-label mb-4">Verdict distribution</p>
        <div className="space-y-4">
          <DistBar label="Scam"       count={stats.scam_count}       total={stats.total_analyzed} color="#dc2626" />
          <DistBar label="Suspicious" count={stats.suspicious_count} total={stats.total_analyzed} color="#d97706" />
          <DistBar label="Safe"       count={stats.safe_count}       total={stats.total_analyzed} color="#16a34a" />
        </div>
        {stats.total_analyzed === 0 && (
          <p className="text-center text-sm text-[var(--color-brown-400)] py-5 mt-2">
            No data yet. Run your first analysis to see stats.
          </p>
        )}
      </div>

      {/* Engine status */}
      <div className="card flex items-center gap-3 flex-wrap">
        <div className="w-9 h-9 rounded-full bg-[var(--color-cream-100)] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M9 1.5L2 4.5V9C2 13 5.2 16.6 9 17.5C12.8 16.6 16 13 16 9V4.5L9 1.5Z" stroke="var(--color-brown-500)" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M5.5 9L7.8 11.3L12.5 6.5" stroke="var(--color-brown-500)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-brown-800)]">Engine status</p>
          <p className="text-xs text-[var(--color-brown-400)]">ML model active · TF-IDF + Logistic Regression</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <span className="animate-pulse-dot w-2 h-2 rounded-full bg-[var(--color-safe)]" />
          <span className="text-xs text-[var(--color-safe-dark)] font-medium">Online</span>
        </div>
      </div>
    </div>
  );
}
