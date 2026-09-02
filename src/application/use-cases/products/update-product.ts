import type { ProductDto } from "@/application/dtos";
import { toProductDto } from "@/application/mappers/to-dto";
import { createProductSchema, deleteProductSchema } from "@/application/schemas";
import { NotFoundError } from "@/domain/errors";
import type {
  CategoryRepository,
  MediaRepository,
  MediaStorage,
  ProductRepository,
} from "@/domain/ports";
import {
  assertUniqueProductName,
  requireLeafCategory,
  resolveProductWrite,
} from "./product-policy";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** Updates a product; replacing mediaId deletes the previous files after success. */
export class UpdateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    private readonly media: MediaRepository,
    private readonly storage: MediaStorage,
  ) {}

  async execute(input: unknown): Promise<ProductDto> {
    const { id } = parseOrThrow(deleteProductSchema, input);
    const data = parseOrThrow(createProductSchema, input);
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new NotFoundError();
    }
    await requireLeafCategory(this.categories, data.categoryId);
    await assertUniqueProductName(this.products, data.categoryId, data.name, id);
    const write = resolveProductWrite(data);
    const updated = await this.products.update(id, write);
    const previousMediaId = existing.mediaId;
    if (previousMediaId && previousMediaId !== write.mediaId) {
      await this.media.delete(previousMediaId);
      await this.storage.deleteAll(previousMediaId);
    }
    return toProductDto(updated);
  }
}
