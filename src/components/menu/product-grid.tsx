import type { ProductDto } from "@/application/dtos";
import { ProductCard } from "./product-card";

type Props = {
  products: ProductDto[];
  priorityStartIndex?: number;
  onOpenPeek: (product: ProductDto) => void;
};

export function ProductGrid({
  products,
  priorityStartIndex = 0,
  onOpenPeek,
}: Props) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2"
      data-testid="product-grid"
    >
      {products.map((product, index) => {
        const tier = product.badges.includes("POPULAR") ? "signature" : "standard";
        return (
          <div key={product.id} className={tier === "signature" ? "md:col-span-2" : undefined}>
            <ProductCard
              product={product}
              tier={tier}
              index={index}
              priority={priorityStartIndex + index < 4}
              onOpenPeek={onOpenPeek}
            />
          </div>
        );
      })}
    </div>
  );
}