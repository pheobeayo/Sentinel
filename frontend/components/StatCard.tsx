interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div
      className={`rounded-xl p-3 sm:p-4 ${
        accent ? "bg-[var(--color-brown-700)] text-white" : "bg-[var(--color-cream-100)]"
      }`}
    >
      <p
        className={`section-label mb-1 ${accent ? "text-[var(--color-cream-200)]" : ""}`}
        style={{ fontSize: "0.625rem" }}
      >
        {label}
      </p>
      <p
        className={`text-xl sm:text-2xl font-semibold tracking-tight ${
          accent ? "text-white" : "text-[var(--color-brown-800)]"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs mt-0.5 leading-tight ${
            accent ? "text-[var(--color-cream-200)]" : "text-[var(--color-brown-400)]"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
