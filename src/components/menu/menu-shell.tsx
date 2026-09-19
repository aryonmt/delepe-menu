// src/components/menu/menu-shell.tsx
"use client";
import { useCallback, useMemo, useState } from "react";
import type { CategoryDto, ProductDto } from "@/application/dtos";
import { NAV_OFFSET_DESKTOP_PX, NAV_OFFSET_MOBILE_PX } from "@/lib/constants";
import { CategorySection } from "./category-section";
import { ALL_SUBCATEGORY_CHIP, ContextStrip, type ChipId } from "./context-strip";
import { DishPeek } from "./dish-peek";
import { DishTicker } from "./dish-ticker";
import { Dock } from "./dock";
import { HeroWordmark } from "./hero-wordmark";
import { MenuFooter } from "./menu-footer";
import {
  findSection,
  relativeTopOf,
  scrollTopOf,
  scrollToY,
  type ScrollRoot,
} from "./scroll-root";

type Props = {
  categories: CategoryDto[];
  restaurantName: string;
  /** Resolved ticker items (curated or fallback) from the page. */
  tickerItems: ProductDto[];
  /** Contained scroller for the admin phone preview (docs/07). */
  scrollRoot?: HTMLElement | null;
};

/** leaf/top categoryId → top-level categoryId (chip state is keyed by top-level). */
function buildTopLevelIndex(categories: CategoryDto[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const top of categories) {
    map.set(top.id, top.id);
    for (const child of top.children) map.set(child.id, top.id);
  }
  return map;
}

export function MenuShell({ categories, restaurantName, tickerItems, scrollRoot }: Props) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const [chipByCategory, setChipByCategory] = useState<Record<string, ChipId>>({});
  const [peekProduct, setPeekProduct] = useState<ProductDto | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const dockTabs = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories],
  );
  const topLevelIndex = useMemo(() => buildTopLevelIndex(categories), [categories]);

  const activeIndex = Math.max(0, categories.findIndex((category) => category.id === activeId));
  const active = categories[activeIndex] ?? null;
  const selectedChip = (active && chipByCategory[active.id]) || ALL_SUBCATEGORY_CHIP;

  const jumpToCategory = useCallback((id: string) => {
    const root: ScrollRoot = scrollRoot ?? window;
    const target = findSection(root, id);
    if (!target) return;
    const isDesktop = !scrollRoot && window.innerWidth >= 768;
    const headerOffset = isDesktop ? NAV_OFFSET_DESKTOP_PX : NAV_OFFSET_MOBILE_PX;
    const top = relativeTopOf(target, root) + scrollTopOf(root) - headerOffset;
    scrollToY(root, Math.max(0, top));
    setSettlingId(id);
    window.setTimeout(() => setSettlingId((current) => (current === id ? null : current)), 400);
  }, [scrollRoot]);

  const jumpToProduct = useCallback(
    (product: ProductDto) => {
      const topLevelId = topLevelIndex.get(product.categoryId);
      if (topLevelId) {
        setActiveId(topLevelId);
        setChipByCategory((prev) => ({ ...prev, [topLevelId]: ALL_SUBCATEGORY_CHIP }));
      }
      const scroll = () => {
        const scope: ParentNode = scrollRoot ?? document;
        const element = scope.querySelector(
          `[data-testid="product-${CSS.escape(product.name)}"]`,
        );
        if (!(element instanceof HTMLElement)) return;
        element.scrollIntoView({ behavior: "auto", block: "center" });
        element.classList.remove("peek-flash");
        void element.offsetWidth;
        element.classList.add("peek-flash");
        window.setTimeout(() => element.classList.remove("peek-flash"), 650);
      };
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scroll);
      });
    },
    [topLevelIndex, scrollRoot],
  );

  return (
    <>
      <HeroWordmark restaurantName={restaurantName}>
        <DishTicker items={tickerItems} onJump={jumpToProduct} />
      </HeroWordmark>

      {/* Unified sticky nav header: tabs row + subcategory row (docs/05/06). */}
      <header className="glass-panel sticky top-0 z-40 border-b border-line">
        <Dock
          categories={dockTabs}
          activeId={activeId}
          onActiveIdChange={setActiveId}
          onJump={jumpToCategory}
          scrollRoot={scrollRoot ?? undefined}
        />
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
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-12 px-3.5 pb-16 pt-2 sm:px-6 md:pb-20">
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

      <MenuFooter />

      <DishPeek
        product={peekProduct}
        onClose={() => setPeekProduct(null)}
        container={scrollRoot}
      />
    </>
  );
}