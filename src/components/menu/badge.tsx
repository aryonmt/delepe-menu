import { Flame, FlameKindling, Leaf, Sparkles } from "lucide-react";
import type { BadgeKind } from "@/domain/entities";
import { strings } from "@/lib/fa/strings";

type Props = {
  kind: BadgeKind;
};

const badgeConfig: Record<BadgeKind, { label: string; icon: typeof Flame }> = {
  POPULAR: { label: strings.badges.POPULAR, icon: Flame },
  NEW: { label: strings.badges.NEW, icon: Sparkles },
  SPICY: { label: strings.badges.SPICY, icon: FlameKindling },
  VEGETARIAN: { label: strings.badges.VEGETARIAN, icon: Leaf },
};

export function Badge({ kind }: Props) {
  const config = badgeConfig[kind];
  const Icon = config.icon;
  const suffix = kind.toLowerCase();
  return (
    <span
      data-testid={`badge-${kind}`}
      className="inline-flex items-center gap-1 rounded-stamp px-2 py-0.5 text-[11px] font-extrabold"
      style={{
        background: `var(--badge-${suffix})`,
        color: `var(--badge-${suffix}-foreground)`,
      }}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}