import { describe, expect, it } from "vitest";
import type { AdminMenuDto, ProductDto } from "@/application/dtos";
import { toPublicMenu } from "./to-public-menu";

function product(overrides: Partial<ProductDto> & Pick<ProductDto, "id" | "name">): ProductDto {
  return {
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

function adminMenu(
  unavailableMode: "HIDE" | "MUTED",
  categories: AdminMenuDto["categories"],
): AdminMenuDto {
  return {
    settings: {
      restaurantName: "دلِپ",
      theme: "WARM_HONEY",
      unavailableMode,
      tickerProductIds: [],
    },
    categories,
  };
}

describe("toPublicMenu", () => {
  it("removes unavailable products when mode is HIDE (BR-08)", () => {
    const input = adminMenu("HIDE", [
      {
        id: "drinks",
        name: "نوشیدنی",
        parentId: null,
        sortOrder: 10,
        children: [],
        products: [
          product({ id: "a", name: "لاته", isAvailable: true }),
          product({ id: "b", name: "موکا", isAvailable: false }),
        ],
      },
    ]);
    const result = toPublicMenu(input);
    expect(result.categories[0]?.products.map((item) => item.id)).toEqual(["a"]);
  });

  it("keeps unavailable products when mode is MUTED (BR-08)", () => {
    const input = adminMenu("MUTED", [
      {
        id: "drinks",
        name: "نوشیدنی",
        parentId: null,
        sortOrder: 10,
        children: [],
        products: [
          product({ id: "a", name: "لاته", isAvailable: true }),
          product({ id: "b", name: "موکا", isAvailable: false }),
        ],
      },
    ]);
    const result = toPublicMenu(input);
    expect(result.categories[0]?.products.map((item) => item.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("prunes categories that have zero visible products after HIDE (BR-08)", () => {
    const input = adminMenu("HIDE", [
      {
        id: "empty",
        name: "خالی",
        parentId: null,
        sortOrder: 10,
        children: [],
        products: [product({ id: "x", name: "مخفی", isAvailable: false })],
      },
      {
        id: "kept",
        name: "مانده",
        parentId: null,
        sortOrder: 20,
        children: [],
        products: [product({ id: "y", name: "لاته", isAvailable: true })],
      },
    ]);
    const result = toPublicMenu(input);
    expect(result.categories.map((item) => item.id)).toEqual(["kept"]);
  });

  it("prunes empty child categories and then empty parents (BR-08)", () => {
    const input = adminMenu("HIDE", [
      {
        id: "food",
        name: "غذا",
        parentId: null,
        sortOrder: 10,
        products: [],
        children: [
          {
            id: "burgers",
            name: "برگر",
            parentId: "food",
            sortOrder: 10,
            children: [],
            products: [
              product({
                id: "gone",
                name: "تمام",
                isAvailable: false,
                categoryId: "burgers",
              }),
            ],
          },
        ],
      },
    ]);
    expect(toPublicMenu(input).categories).toEqual([]);
  });

  it("keeps a parent when a child still has visible products (BR-08)", () => {
    const input = adminMenu("MUTED", [
      {
        id: "food",
        name: "غذا",
        parentId: null,
        sortOrder: 10,
        products: [],
        children: [
          {
            id: "burgers",
            name: "برگر",
            parentId: "food",
            sortOrder: 10,
            children: [],
            products: [
              product({
                id: "p",
                name: "برگر کلاسیک",
                isAvailable: false,
                categoryId: "burgers",
              }),
            ],
          },
        ],
      },
    ]);
    const result = toPublicMenu(input);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]?.children[0]?.products).toHaveLength(1);
  });

  it("passes settings through unchanged (BR-08)", () => {
    const input = adminMenu("MUTED", []);
    expect(toPublicMenu(input).settings).toEqual(input.settings);
    expect(toPublicMenu(input).settings).not.toBe(input.settings);
  });

  it("keeps variants on the public card without a from-price (BR-06)", () => {
    const input = adminMenu("MUTED", [
      {
        id: "pizza",
        name: "پیتزا",
        parentId: null,
        sortOrder: 10,
        children: [],
        products: [
          product({
            id: "m",
            name: "مارگاریتا",
            price: 550_000,
            variants: [
              { id: "s", name: "کوچک", price: 550_000, discountedPrice: null, discountActive: false, isAvailable: true, sortOrder: 10 },
              { id: "l", name: "بزرگ", price: 750_000, discountedPrice: null, discountActive: false, isAvailable: true, sortOrder: 20 },
            ],
          }),
        ],
      },
    ]);
    const card = toPublicMenu(input).categories[0]?.products[0];
    expect(card?.variants).toHaveLength(2);
    expect(card?.price).toBe(550_000);
  });

  it("drops unavailable variants when mode is HIDE (BR-08)", () => {
    const pizza = product({
      id: "m",
      name: "مارگاریتا",
      price: 600_000,
      variants: [
        {
          id: "s",
          name: "کوچک",
          price: 550_000,
          discountedPrice: null,
          discountActive: false,
          isAvailable: true,
          sortOrder: 10,
        },
        {
          id: "l",
          name: "بزرگ",
          price: 750_000,
          discountedPrice: null,
          discountActive: false,
          isAvailable: false,
          sortOrder: 20,
        },
      ],
    });
    const categories: AdminMenuDto["categories"] = [
      {
        id: "pizza",
        name: "پیتزا",
        parentId: null,
        sortOrder: 10,
        children: [],
        products: [pizza],
      },
    ];
    const hidden = toPublicMenu(adminMenu("HIDE", categories)).categories[0]?.products[0];
    expect(hidden?.variants.map((variant) => variant.name)).toEqual(["کوچک"]);
    const muted = toPublicMenu(adminMenu("MUTED", categories)).categories[0]?.products[0];
    expect(muted?.variants).toHaveLength(2);
  });

  it("does not mutate the admin input", () => {
    const input = adminMenu("HIDE", [
      {
        id: "c",
        name: "چای",
        parentId: null,
        sortOrder: 10,
        children: [],
        products: [
          product({ id: "a", name: "چای", isAvailable: true }),
          product({ id: "b", name: "ماسالا", isAvailable: false }),
        ],
      },
    ]);
    const before = JSON.stringify(input);
    toPublicMenu(input);
    expect(JSON.stringify(input)).toBe(before);
  });
});
