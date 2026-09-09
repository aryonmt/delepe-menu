import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/domain/errors";
import { createRepos, seedLeafCategory } from "@/application/testing/harness";
import { CreateProductUseCase } from "./create-product";
import { DeleteProductUseCase } from "./delete-product";

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
    await new DeleteProductUseCase(
      repos.products,
      repos.media,
      repos.storage,
      repos.settings,
    ).execute({
      id: created.id,
    });
    expect(await repos.products.findById(created.id)).toBeNull();
    expect(await repos.media.findById("pic")).toBeNull();
    expect(repos.db.deletedMediaFiles).toEqual(["pic"]);
  });

  it("removes the product id from settings tickerProductIds", async () => {
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
    await repos.settings.upsert({
      restaurantName: "دلِپ",
      theme: "WARM_HONEY",
      unavailableMode: "MUTED",
      tickerProductIds: [created.id, "keep-me"],
    });
    await new DeleteProductUseCase(
      repos.products,
      repos.media,
      repos.storage,
      repos.settings,
    ).execute({ id: created.id });
    expect((await repos.settings.get())?.tickerProductIds).toEqual(["keep-me"]);
  });

  it("throws NotFoundError for an unknown product", async () => {
    const repos = createRepos();
    await expect(
      new DeleteProductUseCase(
        repos.products,
        repos.media,
        repos.storage,
        repos.settings,
      ).execute({
        id: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
