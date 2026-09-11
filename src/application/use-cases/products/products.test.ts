import { describe, expect, it } from "vitest";
import { ValidationError } from "@/domain/errors";
import { createRepos, seedLeafCategory } from "@/application/testing/harness";
import { CreateCategoryUseCase } from "@/application/use-cases/categories/create-category";
import { CreateProductUseCase } from "./create-product";
import { UpdateProductUseCase } from "./update-product";
import { productDtoToUpdateInput } from "@/application/mappers/product-dto-to-update-input";

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
        error instanceof ValidationError && error.code === "VALIDATION",
    );
  });

  it("keeps the owner-entered base price when variants exist (BR-13)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos, "پیتزا");
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "مارگاریتا",
      price: 600_000,
      categoryId: leaf.id,
      variants: [
        { name: "بزرگ", price: 750_000 },
        { name: "کوچک", price: 550_000 },
      ],
    });
    expect(created.price).toBe(600_000);
    expect(created.variants).toHaveLength(2);
  });

  it("rejects duplicate variant names on create", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    await expect(
      new CreateProductUseCase(repos.products, repos.categories).execute({
        name: "برگر",
        price: 200_000,
        categoryId: leaf.id,
        variants: [
          { name: "سایز بزرگ", price: 200_000 },
          { name: "سایز بزرگ", price: 250_000 },
        ],
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "VALIDATION",
    );
  });

  it("allows product discount together with per-variant discount (BR-14)", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "پیتزا",
      price: 600_000,
      categoryId: leaf.id,
      discountActive: true,
      discountedPrice: 520_000,
      variants: [
        {
          name: "کوچک",
          price: 550_000,
          discountActive: true,
          discountedPrice: 480_000,
        },
        { name: "بزرگ", price: 750_000 },
      ],
    });
    expect(created.discountActive).toBe(true);
    expect(created.discountedPrice).toBe(520_000);
    expect(created.variants[0]?.discountedPrice).toBe(480_000);
    expect(created.variants[1]?.discountActive).toBe(false);
  });

  it("persists per-variant availability independently of the product", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    const created = await new CreateProductUseCase(
      repos.products,
      repos.categories,
    ).execute({
      name: "پیتزا",
      price: 600_000,
      categoryId: leaf.id,
      variants: [
        { name: "کوچک", price: 550_000, isAvailable: true },
        { name: "بزرگ", price: 750_000, isAvailable: false },
      ],
    });
    expect(created.isAvailable).toBe(true);
    expect(created.variants[0]?.isAvailable).toBe(true);
    expect(created.variants[1]?.isAvailable).toBe(false);
  });
});

describe("UpdateProductUseCase", () => {
  it("does not overwrite base price when a variant is removed (BR-13)", async () => {
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
      price: 600_000,
      categoryId: leaf.id,
      variants: [
        { name: "کوچک", price: 550_000 },
        { name: "بزرگ", price: 750_000 },
      ],
    });
    const updated = await update.execute({
      id: created.id,
      name: "پیتزا",
      price: 600_000,
      categoryId: leaf.id,
      variants: [{ name: "بزرگ", price: 750_000 }],
    });
    expect(updated.price).toBe(600_000);
    expect(updated.variants).toHaveLength(1);
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

  it("keeps media when toggling availability via productDtoToUpdateInput", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    await repos.media.create({
      id: "pic",
      fileName: "pic.jpg",
      mimeType: "image/jpeg",
      width: 800,
      height: 800,
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
    const updated = await new UpdateProductUseCase(
      repos.products,
      repos.categories,
      repos.media,
      repos.storage,
    ).execute(productDtoToUpdateInput(created, { isAvailable: false }));
    expect(updated.isAvailable).toBe(false);
    expect(updated.media?.id).toBe("pic");
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
