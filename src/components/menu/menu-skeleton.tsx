export function MenuSkeleton() {
  return (
    <div className="space-y-6 p-4" data-testid="menu-skeleton">
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-card border border-border bg-card p-3">
            <div className="h-[78px] w-[104px] animate-pulse rounded-image bg-muted md:h-[105px] md:w-[140px]" />
            <div className="flex flex-1 flex-col gap-2 py-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return <div className="h-[200px] w-full animate-pulse bg-muted" data-testid="hero-skeleton" />;
}
