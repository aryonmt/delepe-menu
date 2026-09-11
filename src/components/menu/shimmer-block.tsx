import { SHIMMER_DURATION_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Faded skeleton surface with a horizontal shimmer (docs/05). */
export function ShimmerBlock({ className }: Props) {
  return (
    <div
      className={cn("relative overflow-hidden bg-card-2", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-y-0 start-0 w-2/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          animation: `shimmer ${String(SHIMMER_DURATION_MS)}ms ease-in-out infinite`,
        }}
      />
    </div>
  );
}
