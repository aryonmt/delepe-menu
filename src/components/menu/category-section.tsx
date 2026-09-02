import type { CategoryDto } from "@/application/dtos";
import { ProductCard } from "./product-card";
import { SectionHeader, SubHeader } from "./section-header";

type Props = {
  category: CategoryDto;
  priorityStartIndex?: number;
};

export function CategorySection({ category, priorityStartIndex = 0 }: Props) {
  const hasChildren = category.children.length > 0;

  return (
    <section
      id={`section-${category.id}`}
      data-testid={`section-${category.name}`}
      className="scroll-mt-24"
      aria-labelledby={`heading-${category.id}`}
    >
      <div id={`heading-${category.id}`}>
        <SectionHeader title={category.name} />
      </div>

      {!hasChildren && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {category.products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={priorityStartIndex + index < 4} />
          ))}
        </div>
      )}

      {hasChildren && (
        <div className="space-y-6">
          {category.children.map((child) => (
            <div key={child.id}>
              <SubHeader title={child.name} />
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                {child.products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={priorityStartIndex + index < 4} />
                ))}
              </div>
            </div>
          ))}
          {category.products.length > 0 && (
            <div>
              <SubHeader title="سایر" />
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                {category.products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={priorityStartIndex + index < 4} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
