// src/application/mappers/ticker.ts
import type { ProductDto, PublicMenuDto } from "@/application/dtos";
import { TICKER_MAX_ITEMS } from "@/lib/constants";

function tickerProductIdsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

/**
 * Pure hero-ticker resolver (docs/06 B-10).
 * Curated `settings.tickerProductIds` win (available products only, curated
 * order, capped); an empty/fully-stale curation falls back to the first
 * eligible products in chapter order. Never mutates input.
 */
export function resolveTickerItems(menu: PublicMenuDto): ProductDto[] {
  const byId = new Map<string, ProductDto>();
  for (const category of menu.categories) {
    for (const product of category.products) byId.set(product.id, product);
    for (const child of category.children) {
      for (const product of child.products) byId.set(product.id, product);
    }
  }
  const curated: ProductDto[] = [];
  for (const id of tickerProductIdsOf(menu.settings.tickerProductIds)) {
    const product = byId.get(id);
    if (product && product.isAvailable) curated.push(product);
    if (curated.length >= TICKER_MAX_ITEMS) break;
  }
  if (curated.length > 0) return curated;
  const fallback: ProductDto[] = [];
  for (const category of menu.categories) {
    for (const product of category.products) {
      if (product.isAvailable) fallback.push(product);
    }
    for (const child of category.children) {
      for (const product of child.products) {
        if (product.isAvailable) fallback.push(product);
      }
    }
  }
  return fallback.slice(0, TICKER_MAX_ITEMS);
}
