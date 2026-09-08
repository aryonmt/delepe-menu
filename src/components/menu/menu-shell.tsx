"use client";
import { useCallback, useMemo, useState } from "react";
import type { CategoryDto, ProductDto } from "@/application/dtos";
import { TICKER_MAX_ITEMS } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { CategorySection } from "./category-section";
import { ALL_SUBCATEGORY_CHIP, ContextStrip, type ChipId } from "./context-strip";
import { DishPeek } from "./dish-peek";
import { DishTicker } from "./dish-ticker";
import { Dock } from "./dock";
import { HeroWordmark } from "./hero-wordmark";

type Props = { categories: CategoryDto[]; restaurantName: string };

function flattenAvailableProducts(categories: CategoryDto[]): ProductDto[] {
  const out: ProductDto[] = [];
  const walk = (category: CategoryDto) => {
    out.push(...category.products.filter((product) => product.isAvailable));
    category.children.forEach(walk);
  };
  categories.forEach(walk);
  return out;
}

function buildTopLevelIndex(categories: CategoryDto[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const top of categories) {
    map.set(top.id, top.id);
    for (const child of top.children) map.set(child.id, top.id);
  }
  return map;
}

export function MenuShell({ categories, restaurantName }: Props) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const [chipByCategory, setChipByCategory] = useState<Record<string, ChipId>>({});
  const [peekProduct, setPeekProduct] = useState<ProductDto | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const tickerItems = useMemo(() => flattenAvailableProducts(categories).slice(0, TICKER_MAX_ITEMS), [categories]);
  const dockTabs = useMemo(() => categories.map((c) => ({ id: c.id, name: c.name })), [categories]);
  const topLevelIndex = useMemo(() => buildTopLevelIndex(categories), [categories]);
  
  const activeIndex = Math.max(0, categories.findIndex((c) => c.id === activeId));
  const active = categories[activeIndex] ?? null;
  const selectedChip = (active && chipByCategory[active.id]) || ALL_SUBCATEGORY_CHIP;

  const jumpToCategory = useCallback((id: string) => {
    const target = document.getElementById(`section-${id}`);
    if (!target) return;
    const isDesktop = window.innerWidth >= 768;
    const headerOffset = isDesktop ? 116 : 52;
    const rect = target.getBoundingClientRect();
    const absoluteTargetTop = rect.top + window.scrollY - headerOffset;
    
    // B-01: Near-instant jump
    window.scrollTo({ top: Math.max(0, absoluteTargetTop), behavior: "auto" });
    setSettlingId(id);
    window.setTimeout(() => setSettlingId((current) => (current === id ? null : current)), 400);
  }, []);

  const jumpToProduct = useCallback(
    (product: ProductDto) => {
      // Fix: Map leaf categoryId to top-level id to correctly reset chips
      const topLevelId = topLevelIndex.get(product.categoryId);
      if (topLevelId) {
        setChipByCategory((prev) => ({ ...prev, [topLevelId]: ALL_SUBCATEGORY_CHIP }));
      }
      window.requestAnimationFrame(() => {
        const element = document.querySelector(`[data-testid="product-${CSS.escape(product.name)}"]`);
        if (!(element instanceof HTMLElement)) return;
        element.scrollIntoView({ behavior: "auto", block: "center" });
        element.classList.remove("peek-flash");
        void element.offsetWidth;
        element.classList.add("peek-flash");
        window.setTimeout(() => element.classList.remove("peek-flash"), 650);
      });
    },
    [topLevelIndex],
  );

  return (
    <>
      <HeroWordmark restaurantName={restaurantName}>
        <DishTicker items={tickerItems} onJump={jumpToProduct} />
      </HeroWordmark>
      <Dock categories={dockTabs} activeId={activeId} onActiveIdChange={setActiveId} onJump={jumpToCategory} />
      <ContextStrip
        activeCategory={active}
        hueIndex={activeIndex}
        selectedChip={selectedChip}
        onChipSelect={(id) => {
          if (!active) return;
          setChipByCategory((current) => ({ ...current, [active.id]: id }));
          jumpToCategory(active.id);
        }}
      />
      <main className="mx-auto w-full max-w-2xl space-y-12 px-3.5 pb-44 pt-2 sm:px-6 md:pb-28">
        {categories.map((category, index) => (
          <CategorySection
            key={category.id}
            category={category}
            displayIndex={index}
            chipId={chipByCategory[category.id] ?? ALL_SUBCATEGORY_CHIP}
            priorityStartIndex={index === 0 ? 0 : 999}
            settling={settlingId === category.id}
            onOpenPeek={setPeekProduct}
          />
        ))}
      </main>
      <footer className="relative z-10 flex flex-col items-center gap-3 border-t border-line py-10 text-center">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/60" />
          <span className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <span key={index} className="h-2 w-0.5 rotate-[18deg] rounded-full bg-primary/80" />
            ))}
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/60" />
        </div>
        <span className="font-display text-xs text-muted-foreground">{strings.public.footer}</span>
      </footer>
      <DishPeek product={peekProduct} onClose={() => setPeekProduct(null)} />
    </>
  );
}