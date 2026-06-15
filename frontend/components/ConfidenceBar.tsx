"use client";
import { useEffect, useState } from "react";
import type { Verdict } from "@/types";

interface Props {
  confidence: number;
  verdict: Verdict;
}

const BAR_COLOR: Record<Verdict, string> = {
  SCAM: "#dc2626",
  SUSPICIOUS: "#d97706",
  SAFE: "#16a34a",
};

export function ConfidenceBar({ confidence, verdict }: Props) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(confidence), 80);
    return () => clearTimeout(t);
  }, [confidence]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="section-label">Confidence</span>
        <span className="text-sm font-semibold text-[var(--color-brown-800)]">
          {confidence.toFixed(1)}%
        </span>
      </div>
      <div className="conf-bar">
        <div
          className="conf-bar-fill"
          style={{
            width: `${width}%`,
            backgroundColor: BAR_COLOR[verdict],
          }}
        />
      </div>
    </div>
  );
}
