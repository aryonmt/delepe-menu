import { describe, expect, it } from "vitest";
import { CategoryNotEmptyError, NotFoundError, ValidationError } from "@/domain/errors";
import { SORT_ORDER_GAP } from "@/lib/constants";
import { CreateCategoryUseCase } from "./create-category";
import { DeleteCategoryUseCase } from "./delete-category";
import { ReorderCategoriesUseCase } from "./reorder-categories";
import { UpdateCategoryUseCase } from "./update-category";
import { createRepos } from "@/application/testing/harness";
import { CreateProductUseCase } from "@/application/use-cases/products/create-product";

function categoryUseCases(repos: ReturnType<typeof createRepos>) {
  return {
    create: new CreateCategoryUseCase(repos.categories),
    update: new UpdateCategoryUseCase(repos.categories),
    remove: new DeleteCategoryUseCase(repos.categories),
    reorder: new ReorderCategoriesUseCase(repos.categories),
  };
}

describe("CreateCategoryUseCase", () => {
  it("rejects a child under a category that already has a parent (BR-01)", async () => {
    const repos = createRepos();
    const { create } = categoryUseCases(repos);
    const root = await create.execute({ name: "غذا" });
    const child = await create.execute({ name: "برگر", parentId: root.id });
    await expect(
      create.execute({ name: "غیرمجاز", parentId: child.id }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "DEPTH_EXCEEDED",
    );
  });

  it("rejects a duplicate name under the same parent (BR-09)", async () => {
    const repos = createRepos();
    const { create } = categoryUseCases(repos);
    await create.execute({ name: "نوشیدنی گرم" });
    await expect(create.execute({ name: "نوشیدنی گرم" })).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "DUPLICATE_NAME",
    );
  });

  it("allows the same name under a different parent (BR-09)", async () => {
    const repos = createRepos();
    const { create } = categoryUseCases(repos);
    const a = await create.execute({ name: "گرم" });
    const b = await create.execute({ name: "سرد" });
    await create.execute({ name: "قهوه", parentId: a.id });
    const second = await create.execute({ name: "قهوه", parentId: b.id });
    expect(second.name).toBe("قهوه");
    expect(second.parentId).toBe(b.id);
  });

  it("rejects creating a child under a category that owns products (BR-16)", async () => {
    const repos = createRepos();
    const { create } = categoryUseCases(repos);
    const root = await create.execute({ name: "دسر" });
    await new CreateProductUseCase(repos.products, repos.categories).execute({
      name: "چیزکیک",
      price: 180_000,
      categoryId: root.id,
    });
    await expect(
      create.execute({ name: "کیک", parentId: root.id }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "CATEGORY_HAS_PRODUCTS",
    );
  });
});

describe("UpdateCategoryUseCase", () => {
  it("throws NotFoundError for an unknown id", async () => {
    const repos = createRepos();
    const { update } = categoryUseCases(repos);
    await expect(
      update.execute({ id: "missing", name: "x" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects re-parenting that would exceed depth 2 (BR-01)", async () => {
    const repos = createRepos();
    const { create, update } = categoryUseCases(repos);
    const root = await create.execute({ name: "غذا" });
    const child = await create.execute({ name: "برگر", parentId: root.id });
    const other = await create.execute({ name: "دیگر" });
    await expect(
      update.execute({ id: other.id, name: "دیگر", parentId: child.id }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "DEPTH_EXCEEDED",
    );
  });

  it("does not throw DUPLICATE_NAME when the name is unchanged (BR-09)", async () => {
    const repos = createRepos();
    const { create, update } = categoryUseCases(repos);
    const root = await create.execute({ name: "غذا" });
    const updated = await update.execute({ id: root.id, name: "غذا" });
    expect(updated.name).toBe("غذا");
    expect(updated.id).toBe(root.id);
  });

  it("rejects re-parenting a category that has children under a new root (BR-01)", async () => {
    const repos = createRepos();
    const { create, update } = categoryUseCases(repos);
    const food = await create.execute({ name: "غذا" });
    await create.execute({ name: "برگر", parentId: food.id });
    const drinks = await create.execute({ name: "نوشیدنی" });
    await expect(
      update.execute({ id: food.id, name: "غذا", parentId: drinks.id }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "DEPTH_EXCEEDED",
    );
  });

  it("rejects re-parenting onto a category that owns products (BR-16)", async () => {
    const repos = createRepos();
    const { create, update } = categoryUseCases(repos);
    const dessert = await create.execute({ name: "دسر" });
    await new CreateProductUseCase(repos.products, repos.categories).execute({
      name: "چیزکیک",
      price: 180_000,
      categoryId: dessert.id,
    });
    const other = await create.execute({ name: "دیگر" });
    await expect(
      update.execute({ id: other.id, name: "دیگر", parentId: dessert.id }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError &&
        error.code === "CATEGORY_HAS_PRODUCTS",
    );
  });
});

describe("DeleteCategoryUseCase", () => {
  it("rejects deleting a category that still has children (BR-02)", async () => {
    const repos = createRepos();
    const { create, remove } = categoryUseCases(repos);
    const root = await create.execute({ name: "غذا" });
    await create.execute({ name: "برگر", parentId: root.id });
    await expect(remove.execute({ id: root.id })).rejects.toBeInstanceOf(
      CategoryNotEmptyError,
    );
  });

  it("rejects deleting a category that still has products (BR-02)", async () => {
    const repos = createRepos();
    const { create, remove } = categoryUseCases(repos);
    const root = await create.execute({ name: "دسر" });
    await new CreateProductUseCase(repos.products, repos.categories).execute({
      name: "کوکی",
      price: 90_000,
      categoryId: root.id,
    });
    await expect(remove.execute({ id: root.id })).rejects.toBeInstanceOf(
      CategoryNotEmptyError,
    );
  });
});

describe("ReorderCategoriesUseCase", () => {
  it("writes 10/20/30 sort-order gaps (BR-07)", async () => {
    const repos = createRepos();
    const { create, reorder } = categoryUseCases(repos);
    const a = await create.execute({ name: "الف" });
    const b = await create.execute({ name: "ب" });
    const c = await create.execute({ name: "پ" });
    await reorder.execute({
      orderedIds: [c.id, a.id, b.id],
      parentId: null,
    });
    const siblings = await repos.categories.listByParent(null);
    expect(siblings.map((row) => row.id)).toEqual([c.id, a.id, b.id]);
    expect(siblings.map((row) => row.sortOrder)).toEqual([
      SORT_ORDER_GAP,
      SORT_ORDER_GAP * 2,
      SORT_ORDER_GAP * 3,
    ]);
  });

  it("rejects an ordered id list that is not the sibling set (BR-07)", async () => {
    const repos = createRepos();
    const { create, reorder } = categoryUseCases(repos);
    const a = await create.execute({ name: "الف" });
    await expect(
      reorder.execute({ orderedIds: [a.id, "ghost"], parentId: null }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "INVALID_REORDER",
    );
  });
});
