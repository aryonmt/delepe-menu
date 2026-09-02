import { afterAll, describe, expect, it } from "vitest";
import type { ProductWrite } from "@/domain/entities";
import { prisma } from "@/infrastructure/prisma/client";
import { SORT_ORDER_GAP } from "@/lib/constants";
import { PrismaCategoryRepository } from "./category-repository";
import { PrismaProductRepository } from "./product-repository";

const PREFIX = "itest-";

async function databaseReachable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

const dbAvailable = await databaseReachable();

function productWrite(
  categoryId: string,
  name: string,
  variants: ProductWrite["variants"],
): ProductWrite {
  return {
    name,
    description: null,
    price: variants[0]?.price ?? 10_000,
    discountedPrice: null,
    discountActive: false,
    isAvailable: true,
    badges: [],
    categoryId,
    mediaId: null,
    variants,
  };
}

describe("Prisma repositories (integration)", () => {
  const categories = new PrismaCategoryRepository(prisma);
  const products = new PrismaProductRepository(prisma);

  afterAll(async () => {
    if (dbAvailable) {
      await prisma.product.deleteMany({
        where: { name: { startsWith: PREFIX } },
      });
      await prisma.category.deleteMany({
        where: { name: { startsWith: PREFIX } },
      });
    }
    await prisma.$disconnect();
  });

  // Skip when db-test is down so a mistaken `vitest run` of this file stays green.
  it.skipIf(!dbAvailable)(
    "findTree returns a two-level tree with nested products and variants",
    async () => {
      const root = await categories.create(
        { name: `${PREFIX}root`, parentId: null },
        SORT_ORDER_GAP,
      );
      const leaf = await categories.create(
        { name: `${PREFIX}leaf`, parentId: root.id },
        SORT_ORDER_GAP,
      );
      await products.create(
        productWrite(leaf.id, `${PREFIX}latte`, [
          { name: "کوچک", price: 80_000 },
          { name: "بزرگ", price: 120_000 },
        ]),
        SORT_ORDER_GAP,
      );

      const tree = await categories.findTree();
      const node = tree.find((row) => row.id === root.id);
      expect(node?.children).toHaveLength(1);
      expect(node?.children[0]?.products).toHaveLength(1);
      expect(node?.children[0]?.products[0]?.variants.map((v) => v.name)).toEqual(
        ["کوچک", "بزرگ"],
      );
    },
  );

  it.skipIf(!dbAvailable)(
    "update replaces variants transactionally",
    async () => {
      const root = await categories.create(
        { name: `${PREFIX}upd-root`, parentId: null },
        SORT_ORDER_GAP,
      );
      const leaf = await categories.create(
        { name: `${PREFIX}upd-leaf`, parentId: root.id },
        SORT_ORDER_GAP,
      );
      const created = await products.create(
        productWrite(leaf.id, `${PREFIX}upd-drink`, [
          { name: "A", price: 50_000 },
          { name: "B", price: 60_000 },
        ]),
        SORT_ORDER_GAP,
      );

      const updated = await products.update(
        created.id,
        productWrite(leaf.id, `${PREFIX}upd-drink`, [
          { name: "C", price: 70_000 },
        ]),
      );
      expect(updated.variants).toHaveLength(1);
      expect(updated.variants[0]?.name).toBe("C");
      const reloaded = await products.findById(created.id);
      expect(reloaded?.variants.map((v) => v.name)).toEqual(["C"]);
    },
  );

  it.skipIf(!dbAvailable)("reorder persists sibling sortOrder", async () => {
    const root = await categories.create(
      { name: `${PREFIX}ord-root`, parentId: null },
      SORT_ORDER_GAP,
    );
    const leaf = await categories.create(
      { name: `${PREFIX}ord-leaf`, parentId: root.id },
      SORT_ORDER_GAP,
    );
    const first = await products.create(
      productWrite(leaf.id, `${PREFIX}ord-a`, []),
      10,
    );
    const second = await products.create(
      productWrite(leaf.id, `${PREFIX}ord-b`, []),
      20,
    );

    await products.reorder([
      { id: first.id, sortOrder: 20 },
      { id: second.id, sortOrder: 10 },
    ]);
    const listed = await products.listByCategory(leaf.id);
    expect(listed.map((row) => row.id)).toEqual([second.id, first.id]);
  });
});
