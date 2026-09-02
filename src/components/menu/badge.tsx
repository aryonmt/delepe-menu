import { Flame, FlameKindling, Leaf, Sparkles } from "lucide-react";
import { strings } from "@/lib/fa/strings";
import type { BadgeKind } from "@/domain/entities";

type Props = {
  kind: BadgeKind;
};

const config: Record<BadgeKind, { label: string; icon: typeof Flame; className: string }> = {
  POPULAR: { label: strings.badges.POPULAR, icon: Flame, className: "bg-badge-popular text-badge-popular-foreground" },
  NEW: { label: strings.badges.NEW, icon: Sparkles, className: "bg-badge-new text-badge-new-foreground" },
  SPICY: { label: strings.badges.SPICY, icon: FlameKindling, className: "bg-badge-spicy text-badge-spicy-foreground" },
  VEGETARIAN: { label: strings.badges.VEGETARIAN, icon: Leaf, className: "bg-badge-vegetarian text-badge-vegetarian-foreground" },
};

export function Badge({ kind }: Props) {
  const { label, icon: Icon, className } = config[kind];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
      data-testid={`badge-${kind}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
