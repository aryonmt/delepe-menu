import { describe, expect, it } from "vitest";
import { NotFoundError, ValidationError } from "@/domain/errors";
import { effectivePrice } from "@/domain/pricing";
import { SORT_ORDER_GAP } from "@/lib/constants";
import { createProductSchema } from "@/application/schemas";
import { createRepos, seedLeafCategory } from "@/application/testing/harness";
import { CreateCategoryUseCase } from "@/application/use-cases/categories/create-category";
import { CreateProductUseCase } from "./create-product";
import { DeleteProductUseCase } from "./delete-product";
import { ReorderProductsUseCase } from "./reorder-products";
import { UpdateProductUseCase } from "./update-product";

describe("CreateProductUseCase", () => {
  it("rejects a non-leaf category (BR-15)", async () => {
    const repos = createRepos();
    const { root } = await seedLeafCategory(repos);
    const create = new CreateProductUseCase(repos.products, repos.categories);
    await expect(
      create.execute({ name: "برگر", price: 450_000, categoryId: root.id }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "NOT_LEAF_CATEGORY",
    );
  });

  it("rejects a duplicate product name in the same category (BR-09)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const create = new CreateProductUseCase(repos.products, repos.categories);
    await create.execute({ name: "لاته", price: 250_000, categoryId: leaf.id });
    await expect(
      create.execute({ name: "لاته", price: 260_000, categoryId: leaf.id }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "DUPLICATE_NAME",
    );
  });

  it("rejects discountedPrice that is not below price (BR-04)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const create = new CreateProductUseCase(repos.products, repos.categories);
    await expect(
      create.execute({
        name: "کوکی",
        price: 115_000,
        discountedPrice: 115_000,
        discountActive: true,
        categoryId: leaf.id,
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "INVALID_DISCOUNT",
    );
  });

  it("sets price to min(variant prices) when variants exist (BR-13)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos, "پیتزا");
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "مارگاریتا",
      price: 999_000,
      categoryId: leaf.id,
      variants: [
        { name: "بزرگ", price: 750_000 },
        { name: "کوچک", price: 550_000 },
      ],
    });
    expect(created.price).toBe(550_000);
    expect(created.variants).toHaveLength(2);
  });

  it("rejects discount on product with variants (BR-14)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    await expect(
      new CreateProductUseCase(repos.products, repos.categories).execute({
        name: "پیتزا",
        categoryId: leaf.id,
        discountActive: true,
        discountedPrice: 100_000,
        variants: [
          { name: "کوچک", price: 550_000 },
          { name: "بزرگ", price: 750_000 },
        ],
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError &&
        error.code === "DISCOUNT_WITH_VARIANTS",
    );
  });
});

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

describe("UpdateProductUseCase", () => {
  it("recomputes base price when a variant is removed (BR-13)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const create = new CreateProductUseCase(repos.products, repos.categories);
    const update = new UpdateProductUseCase(
      repos.products,
      repos.categories,
      repos.media,
      repos.storage,
    );
    const created = await create.execute({
      name: "پیتزا",
      categoryId: leaf.id,
      variants: [
        { name: "کوچک", price: 550_000 },
        { name: "بزرگ", price: 750_000 },
      ],
    });
    const updated = await update.execute({
      id: created.id,
      name: "پیتزا",
      categoryId: leaf.id,
      variants: [{ name: "بزرگ", price: 750_000 }],
    });
    expect(updated.price).toBe(750_000);
  });

  it("deletes the previous media after a successful image replace", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    await repos.media.create({
      id: "old",
      fileName: "old.jpg",
      mimeType: "image/jpeg",
      width: 800,
      height: 600,
      dominantColor: "#000000",
      path: "uploads/old.jpg",
    });
    await repos.media.create({
      id: "new",
      fileName: "new.jpg",
      mimeType: "image/jpeg",
      width: 800,
      height: 600,
      dominantColor: "#ffffff",
      path: "uploads/new.jpg",
    });
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "لاته",
      price: 250_000,
      categoryId: leaf.id,
      mediaId: "old",
    });
    await new UpdateProductUseCase(
      repos.products,
      repos.categories,
      repos.media,
      repos.storage,
    ).execute({
      id: created.id,
      name: "لاته",
      price: 250_000,
      categoryId: leaf.id,
      mediaId: "new",
    });
    expect(await repos.media.findById("old")).toBeNull();
    expect(repos.db.deletedMediaFiles).toContain("old");
  });

  it("does not throw DUPLICATE_NAME when the name is unchanged (BR-09)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "لاته",
      price: 250_000,
      categoryId: leaf.id,
    });
    const updated = await new UpdateProductUseCase(
      repos.products,
      repos.categories,
      repos.media,
      repos.storage,
    ).execute({
      id: created.id,
      name: "لاته",
      price: 250_000,
      categoryId: leaf.id,
    });
    expect(updated.name).toBe("لاته");
    expect(updated.id).toBe(created.id);
  });
});

describe("DeleteProductUseCase", () => {
  it("hard-deletes the product and its media files (BR-03)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    await repos.media.create({
      id: "pic",
      fileName: "pic.jpg",
      mimeType: "image/jpeg",
      width: 800,
      height: 600,
      dominantColor: "#123456",
      path: "uploads/pic.jpg",
    });
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "لاته",
      price: 250_000,
      categoryId: leaf.id,
      mediaId: "pic",
    });
    await new DeleteProductUseCase(repos.products, repos.media, repos.storage).execute({
      id: created.id,
    });
    expect(await repos.products.findById(created.id)).toBeNull();
    expect(await repos.media.findById("pic")).toBeNull();
    expect(repos.db.deletedMediaFiles).toEqual(["pic"]);
  });

  it("throws NotFoundError for an unknown product", async () => {
    const repos = createRepos();
    await expect(
      new DeleteProductUseCase(repos.products, repos.media, repos.storage).execute({
        id: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
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

describe("leaf-only ownership", () => {
  it("still allows products on a root that has no children (BR-15)", async () => {
    const repos = createRepos();
    const root = await new CreateCategoryUseCase(repos.categories).execute({
      name: "نوشیدنی سرد",
    });
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "موهیتو",
      price: 220_000,
      categoryId: root.id,
    });
    expect(created.categoryId).toBe(root.id);
  });
});
