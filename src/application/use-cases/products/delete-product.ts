import { deleteProductSchema } from "@/application/schemas";
import { NotFoundError } from "@/domain/errors";
import type { MediaRepository, MediaStorage, ProductRepository } from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** BR-03: hard-delete the product, then its Media row and all 4 files. */
export class DeleteProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly media: MediaRepository,
    private readonly storage: MediaStorage,
  ) {}

  async execute(input: unknown): Promise<void> {
    const { id } = parseOrThrow(deleteProductSchema, input);
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new NotFoundError();
    }
    const mediaId = existing.mediaId;
    await this.products.delete(id);
    if (mediaId) {
      await this.media.delete(mediaId);
      await this.storage.deleteAll(mediaId);
    }
  }
}
