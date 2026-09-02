import { describe, expect, it } from "vitest";
import { createInMemoryRepos } from "./create-repos";

describe("in-memory repository fakes", () => {
  it("round-trips a category and counts products", async () => {
    const { categories, products } = createInMemoryRepos();
    const root = await categories.create({ name: "نوشیدنی", parentId: null }, 10);
    expect(await categories.findByParentAndName(null, "نوشیدنی")).toEqual(root);
    await products.create(
      {
        name: "لاته",
        description: null,
        price: 250_000,
        discountedPrice: null,
        discountActive: false,
        isAvailable: true,
        badges: [],
        categoryId: root.id,
        mediaId: null,
        variants: [],
      },
      10,
    );
    expect(await categories.countProducts(root.id)).toBe(1);
    expect(await categories.countChildren(root.id)).toBe(0);
  });

  it("shares media deletions across storage and product graph", async () => {
    const repos = createInMemoryRepos();
    await repos.media.create({
      id: "m1",
      fileName: "m1.jpg",
      mimeType: "image/jpeg",
      width: 800,
      height: 600,
      dominantColor: "#111111",
      path: "uploads/m1.jpg",
    });
    await repos.storage.deleteAll("m1");
    expect(repos.db.deletedMediaFiles).toEqual(["m1"]);
  });

  it("upserts an admin user by username", async () => {
    const repos = createInMemoryRepos();
    const first = await repos.adminUsers.upsertByUsername("admin", "hash:a");
    const second = await repos.adminUsers.upsertByUsername("admin", "hash:b");
    expect(second.id).toBe(first.id);
    expect(second.passwordHash).toBe("hash:b");
    expect(await repos.adminUsers.findByUsername("admin")).toEqual(second);
  });
});
