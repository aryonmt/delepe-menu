import { describe, expect, it } from "vitest";
import { effectivePrice } from "@/domain/pricing";
import { SORT_ORDER_GAP } from "@/lib/constants";
import { createProductSchema } from "@/application/schemas";
import { createRepos, seedLeafCategory } from "@/application/testing/harness";
import { CreateProductUseCase } from "./create-product";
import { ReorderProductsUseCase } from "./reorder-products";

describe("createProductSchema", () => {
  it("rejects prices below 1000 toman (BR-12)", () => {
    const result = createProductSchema.safeParse({
      name: "x",
      price: 999,
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects prices above 100,000,000 toman (BR-12)", () => {
    const result = createProductSchema.safeParse({
      name: "x",
      price: 100_000_001,
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });
});

describe("ReorderProductsUseCase", () => {
  it("writes 10/20/30 sort-order gaps (BR-07)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const create = new CreateProductUseCase(repos.products, repos.categories);
    const a = await create.execute({
      name: "الف",
      price: 10_000,
      categoryId: leaf.id,
    });
    const b = await create.execute({
      name: "ب",
      price: 20_000,
      categoryId: leaf.id,
    });
    await new ReorderProductsUseCase(repos.products).execute({
      orderedIds: [b.id, a.id],
      categoryId: leaf.id,
    });
    const listed = await repos.products.listByCategory(leaf.id);
    expect(listed.map((row) => row.id)).toEqual([b.id, a.id]);
    expect(listed.map((row) => row.sortOrder)).toEqual([
      SORT_ORDER_GAP,
      SORT_ORDER_GAP * 2,
    ]);
  });
});

describe("effective display price on a created product", () => {
  it("matches BR-05 for a discounted item without variants", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "کوکی متوسط",
      price: 115_000,
      discountedPrice: 95_000,
      discountActive: true,
      categoryId: leaf.id,
    });
    expect(
      effectivePrice({
        price: created.price,
        discountedPrice: created.discountedPrice,
        discountActive: created.discountActive,
        variantCount: created.variants.length,
      }),
    ).toBe(95_000);
  });
});
