function ShimmerBox({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-card via-card-2 to-card ${className}`}
    />
  );
}

export function HeroSkeleton() {
  return (
    <div
      className="flex min-h-[min(86svh,700px)] w-full flex-col items-center justify-center gap-5"
      data-testid="hero-skeleton"
    >
      <ShimmerBox className="h-6 w-36 rounded-full" />
      <ShimmerBox className="h-3 w-16 rounded-full" />
      <ShimmerBox className="h-16 w-64 rounded-2xl md:h-20 md:w-80" />
      <ShimmerBox className="h-12 w-full" />
    </div>
  );
}

export function MenuSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4" data-testid="menu-skeleton">
      {/* Chapter header */}
      <div className="flex flex-col gap-2 pt-10">
        <ShimmerBox className="h-9 w-40 rounded-lg" />
        <ShimmerBox className="h-1 w-24 rounded-full" />
      </div>
      {/* Card skeletons in both tier shapes */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-card border border-line bg-card">
          <ShimmerBox className="h-44 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <ShimmerBox className="h-4 w-2/3 rounded" />
            <ShimmerBox className="h-3 w-5/6 rounded" />
            <ShimmerBox className="h-4 w-24 rounded" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-card border border-line bg-card p-3"
          >
            <div className="flex-1 space-y-2">
              <ShimmerBox className="h-4 w-3/4 rounded" />
              <ShimmerBox className="h-3 w-5/6 rounded" />
              <ShimmerBox className="h-4 w-20 rounded" />
            </div>
            <ShimmerBox className="aspect-[4/3] w-[42%] rounded-image" />
          </div>
        ))}
      </div>
      {/* Dock bar */}
      <ShimmerBox className="h-14 w-full rounded-full" />
    </div>
  );
}