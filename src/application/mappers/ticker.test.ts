// src/application/mappers/ticker.test.ts
import { describe, expect, it } from "vitest";
import type { ProductDto, PublicMenuDto } from "@/application/dtos";
import { TICKER_MAX_ITEMS } from "@/lib/constants";
import { resolveTickerItems } from "./ticker";

function product(id: string, overrides: Partial<ProductDto> = {}): ProductDto {
  return {
    id,
    name: id,
    description: null,
    price: 100_000,
    discountedPrice: null,
    discountActive: false,
    isAvailable: true,
    badges: [],
    sortOrder: 10,
    categoryId: "leaf",
    variants: [],
    media: null,
    ...overrides,
  };
}

function menu(tickerProductIds: string[], products: ProductDto[]): PublicMenuDto {
  return {
    settings: {
      restaurantName: "دلِپ",
      theme: "WARM_HONEY",
      unavailableMode: "MUTED",
      tickerProductIds,
    },
    categories: [
      {
        id: "c",
        name: "فصل",
        parentId: null,
        sortOrder: 10,
        children: [],
        products,
      },
    ],
  };
}

describe("resolveTickerItems", () => {
  it("follows the curated order, not chapter order", () => {
    const a = product("a");
    const b = product("b");
    const result = resolveTickerItems(menu(["b", "a"], [a, b]));
    expect(result.map((p) => p.id)).toEqual(["b", "a"]);
  });
  it("skips unavailable and missing ids", () => {
    const a = product("a");
    const gone = product("gone", { isAvailable: false });
    const result = resolveTickerItems(menu(["gone", "ghost", "a"], [a, gone]));
    expect(result.map((p) => p.id)).toEqual(["a"]);
  });
  it("falls back to chapter order when curation is empty", () => {
    const a = product("a");
    const b = product("b", { isAvailable: false });
    const c = product("c");
    const result = resolveTickerItems(menu([], [a, b, c]));
    expect(result.map((p) => p.id)).toEqual(["a", "c"]);
  });
  it("falls back when every curated id is stale", () => {
    const a = product("a");
    const result = resolveTickerItems(menu(["ghost"], [a]));
    expect(result.map((p) => p.id)).toEqual(["a"]);
  });
  it("treats missing tickerProductIds as empty curation (legacy settings rows)", () => {
    const a = product("a");
    const menuWithoutIds = {
      ...menu([], [a]),
      settings: {
        restaurantName: "دلِپ",
        theme: "WARM_HONEY" as const,
        unavailableMode: "MUTED" as const,
      },
    } as PublicMenuDto;
    expect(resolveTickerItems(menuWithoutIds).map((p) => p.id)).toEqual(["a"]);
  });
  it("caps the result at TICKER_MAX_ITEMS", () => {
    const many = Array.from({ length: TICKER_MAX_ITEMS + 5 }, (_, i) => product(`p${i}`));
    const ids = many.map((p) => p.id);
    expect(resolveTickerItems(menu(ids, many))).toHaveLength(TICKER_MAX_ITEMS);
    expect(resolveTickerItems(menu([], many))).toHaveLength(TICKER_MAX_ITEMS);
  });
});