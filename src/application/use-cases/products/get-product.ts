import type { ProductDto } from "@/application/dtos";
import { toProductDto } from "@/application/mappers/to-dto";
import { deleteProductSchema } from "@/application/schemas";
import { NotFoundError } from "@/domain/errors";
import type { ProductRepository } from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** Loads one product with variants and media. */
export class GetProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: unknown): Promise<ProductDto> {
    const { id } = parseOrThrow(deleteProductSchema, input);
    const product = await this.products.findById(id);
    if (!product) {
      throw new NotFoundError();
    }
    return toProductDto(product);
  }
}
