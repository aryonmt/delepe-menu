import type { ProductDto } from "@/application/dtos";
import { toProductDto } from "@/application/mappers/to-dto";
import { createProductSchema } from "@/application/schemas";
import type { CategoryRepository, ProductRepository } from "@/domain/ports";
import {
  assertUniqueProductName,
  requireLeafCategory,
  resolveProductWrite,
} from "./product-policy";
import { parseOrThrow } from "@/application/use-cases/shared/parse";
import { nextSortOrder } from "@/application/use-cases/shared/sort";

/** Creates a product after BR-04 / 09 / 12 / 13 / 14 / 15. */
export class CreateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async execute(input: unknown): Promise<ProductDto> {
    const data = parseOrThrow(createProductSchema, input);
    await requireLeafCategory(this.categories, data.categoryId);
    await assertUniqueProductName(this.products, data.categoryId, data.name);
    const write = resolveProductWrite(data);
    const siblings = await this.products.listByCategory(data.categoryId);
    const created = await this.products.create(write, nextSortOrder(siblings));
    return toProductDto(created);
  }
}
