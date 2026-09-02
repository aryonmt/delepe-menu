type Props = {
  title: string;
};

export function SectionHeader({ title }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <h2 className="font-display text-section font-semibold text-foreground">{title}</h2>
      <div className="ornament-divider w-full max-w-xs text-ornament" aria-hidden="true">
        <span>✦</span>
      </div>
    </div>
  );
}

type SubProps = {
  title: string;
};

export function SubHeader({ title }: SubProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <h3 className="shrink-0 font-display text-[18px] font-semibold text-foreground">{title}</h3>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-ornament/40 to-transparent" aria-hidden="true" />
    </div>
  );
}
