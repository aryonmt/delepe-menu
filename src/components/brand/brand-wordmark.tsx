import { wordmarkClusters } from "@/lib/brand-wordmark";
import { strings } from "@/lib/fa/strings";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * Locked brand string rendered as three clusters so kasras can breathe
 * (docs/05 three-spark motif). The source string is never rewritten.
 */
export function BrandWordmark({ className }: Props) {
  const clusters = wordmarkClusters();
  return (
    <span className="inline-flex items-baseline font-display" aria-label={strings.brand.wordmark}>
      {clusters.map((cluster, index) => (
        <span
          key={`${cluster}-${index}`}
          className={cn("px-px pb-[0.12em] leading-[1.15]", className)}
        >
          {cluster}
        </span>
      ))}
    </span>
  );
}
