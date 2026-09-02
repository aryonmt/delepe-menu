import { describe, expect, it } from "vitest";
import { createRepos, defaultSettings, seedLeafCategory } from "@/application/testing/harness";
import { CreateProductUseCase } from "@/application/use-cases/products/create-product";
import { GetAdminMenuUseCase } from "./get-admin-menu";
import { GetPublicMenuUseCase } from "./get-public-menu";
import { ListCategoriesUseCase } from "@/application/use-cases/categories/list-categories";
import { ListProductsUseCase } from "@/application/use-cases/products/list-products";
import { GetProductUseCase } from "@/application/use-cases/products/get-product";

describe("menu use-cases", () => {
  it("GetAdminMenu returns unfiltered unavailable products", async () => {
    const repos = createRepos();
    await repos.settings.upsert(defaultSettings());
    const { leaf } = await seedLeafCategory(repos);
    await new CreateProductUseCase(repos.products, repos.categories).execute({
      name: "لاته",
      price: 250_000,
      isAvailable: false,
      categoryId: leaf.id,
    });
    const admin = await new GetAdminMenuUseCase(
      repos.categories,
      repos.settings,
    ).execute();
    const products = admin.categories.flatMap((c) => [
      ...c.products,
      ...c.children.flatMap((ch) => ch.products),
    ]);
    expect(products.some((item) => item.name === "لاته" && !item.isAvailable)).toBe(
      true,
    );
  });

  it("GetPublicMenu hides unavailable products in HIDE mode (BR-08)", async () => {
    const repos = createRepos();
    await repos.settings.upsert({
      ...defaultSettings(),
      unavailableMode: "HIDE",
    });
    const { leaf } = await seedLeafCategory(repos);
    const create = new CreateProductUseCase(repos.products, repos.categories);
    await create.execute({
      name: "لاته",
      price: 250_000,
      isAvailable: true,
      categoryId: leaf.id,
    });
    await create.execute({
      name: "موکا",
      price: 280_000,
      isAvailable: false,
      categoryId: leaf.id,
    });
    const pub = await new GetPublicMenuUseCase(
      repos.categories,
      repos.settings,
    ).execute();
    const names = pub.categories
      .flatMap((c) => [...c.products, ...c.children.flatMap((ch) => ch.products)])
      .map((item) => item.name);
    expect(names).toEqual(["لاته"]);
  });
});

describe("list and get", () => {
  it("lists categories as a tree and products flat", async () => {
    const repos = createRepos();
    const { leaf } = await seedLeafCategory(repos);
    await new CreateProductUseCase(repos.products, repos.categories).execute({
      name: "برگر کلاسیک",
      price: 450_000,
      categoryId: leaf.id,
    });
    const tree = await new ListCategoriesUseCase(repos.categories).execute();
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children[0]?.products[0]?.name).toBe("برگر کلاسیک");
    const listed = await new ListProductsUseCase(repos.products).execute();
    expect(listed).toHaveLength(1);
    const first = listed[0];
    if (!first) {
      throw new Error("expected a product");
    }
    const one = await new GetProductUseCase(repos.products).execute({
      id: first.id,
    });
    expect(one.name).toBe("برگر کلاسیک");
  });
});
