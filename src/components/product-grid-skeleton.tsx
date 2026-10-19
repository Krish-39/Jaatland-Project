export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading products…</span>
      <div
        aria-hidden
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <div className="h-56 animate-pulse bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-5 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-8 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-7xl px-4 py-8"
    >
      <span className="sr-only">Loading product…</span>
      <div aria-hidden className="animate-pulse">
        <div className="mb-6 h-8 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-4">
            <div className="h-6 w-28 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-5 w-24 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 w-32 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-11 w-full rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-11 w-full rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
