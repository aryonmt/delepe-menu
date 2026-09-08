"use client";

import type { CategoryDto, ProductDto } from "@/application/dtos";
import { strings } from "@/lib/fa/strings";
import { ChapterHeader, SubHeader } from "./chapter-header";
import { ALL_SUBCATEGORY_CHIP, isAllChips, type ChipId } from "./context-strip";
import { ProductGrid } from "./product-grid";

type Props = {
  category: CategoryDto;
  displayIndex: number;
  chipId?: ChipId;
  priorityStartIndex?: number;
  settling: boolean;
  onOpenPeek: (product: ProductDto) => void;
};

export function CategorySection({
  category,
  displayIndex,
  chipId = ALL_SUBCATEGORY_CHIP,
  priorityStartIndex = 0,
  settling,
  onOpenPeek,
}: Props) {
  const hasChildren = category.children.length > 0;
  const selectedChild =
    hasChildren && !isAllChips(chipId)
      ? (category.children.find((child) => child.id === chipId) ?? null)
      : null;

  return (
    <section
      id={`section-${category.id}`}
      data-testid={`section-${category.name}`}
      className="scroll-mt-[54px] md:scroll-mt-[116px]"
      aria-labelledby={`heading-${category.id}`}
      style={{ "--chapter-hue": `var(--chapter-hue-${(displayIndex % 6) + 1})` } as React.CSSProperties}
    >
      <div id={`heading-${category.id}`}>
        <ChapterHeader title={category.name} displayIndex={displayIndex} settling={settling} />
      </div>

      {!hasChildren && (
        <ProductGrid
          products={category.products}
          priorityStartIndex={priorityStartIndex}
          onOpenPeek={onOpenPeek}
        />
      )}

      {hasChildren && selectedChild && (
        <div className="space-y-3">
          <SubHeader title={selectedChild.name} />
          <ProductGrid
            products={selectedChild.products}
            priorityStartIndex={priorityStartIndex}
            onOpenPeek={onOpenPeek}
          />
        </div>
      )}

      {hasChildren && !selectedChild && (
        <div className="space-y-8">
          {category.children.map((child) => (
            <div key={child.id} className="space-y-3">
              <SubHeader title={child.name} />
              <ProductGrid
                products={child.products}
                priorityStartIndex={priorityStartIndex}
                onOpenPeek={onOpenPeek}
              />
            </div>
          ))}
          {category.products.length > 0 && (
            <div className="space-y-3">
              <SubHeader title={strings.public.otherCategory} />
              <ProductGrid
                products={category.products}
                priorityStartIndex={priorityStartIndex}
                onOpenPeek={onOpenPeek}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}