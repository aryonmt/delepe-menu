// src/app/(public)/page.tsx
import { Suspense } from "react";
import { EmptyState } from "@/components/menu/empty-state";
import { MenuBootGate } from "@/components/menu/menu-boot-gate";
import { MenuShell } from "@/components/menu/menu-shell";
import { MenuLoading } from "@/components/menu/menu-loading";
import { resolveTickerItems } from "@/application/mappers/ticker";
import type { CategoryDto, ProductDto } from "@/application/dtos";
import { collectMenuBootImageUrls } from "@/lib/menu-boot";
import { NotFoundError } from "@/domain/errors";
import { getPublicMenuCached } from "@/lib/public-menu-cache";

export const dynamic = "force-dynamic";

function flattenProducts(categories: CategoryDto[]): ProductDto[] {
  const products: ProductDto[] = [];
  for (const category of categories) {
    products.push(...category.products);
    for (const child of category.children) products.push(...child.products);
  }
  return products;
}

async function MenuContent() {
  let menu: Awaited<ReturnType<typeof getPublicMenuCached>>;
  try {
    menu = await getPublicMenuCached();
  } catch (error) {
    if (error instanceof NotFoundError) return <EmptyState />;
    throw error;
  }
  if (menu.categories.length === 0) return <EmptyState />;
  const tickerItems = resolveTickerItems(menu);
  return (
    <MenuBootGate
      imageUrls={collectMenuBootImageUrls([
        ...tickerItems,
        ...flattenProducts(menu.categories),
      ])}
    >
      <MenuShell
        categories={menu.categories}
        restaurantName={menu.settings.restaurantName}
        tickerItems={tickerItems}
      />
    </MenuBootGate>
  );
}

export default function PublicMenuPage() {
  return (
    <Suspense fallback={<MenuLoading />}>
      <MenuContent />
    </Suspense>
  );
}