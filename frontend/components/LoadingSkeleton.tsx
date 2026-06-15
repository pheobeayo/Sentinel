export function LoadingSkeleton() {
  return (
    <div className="card mt-6 animate-fade-in">
      <div className="flex items-start gap-4 mb-5">
        <div className="skeleton w-6 h-6 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
      </div>
      <div className="skeleton h-2 w-full rounded-full mb-6" />
      <div className="pt-4 border-t border-[var(--color-cream-200)] space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}
