import type { Verdict } from "@/types";

interface Props {
  verdict: Verdict;
  size?: "sm" | "md";
}

export function VerdictBadge({ verdict, size = "md" }: Props) {
  const cls =
    verdict === "SCAM"
      ? "badge-scam"
      : verdict === "SUSPICIOUS"
      ? "badge-suspicious"
      : "badge-safe";

  const label =
    verdict === "SCAM" ? "Scam" : verdict === "SUSPICIOUS" ? "Suspicious" : "Safe";

  return (
    <span
      className={cls}
      style={{ fontSize: size === "sm" ? "0.6875rem" : undefined }}
    >
      {label}
    </span>
  );
}
