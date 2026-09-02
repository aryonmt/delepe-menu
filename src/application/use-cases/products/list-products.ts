import type { ProductDto } from "@/application/dtos";
import { toProductDto } from "@/application/mappers/to-dto";
import type { ProductRepository } from "@/domain/ports";

/** All products (admin list; filtering is client-side over the draft). */
export class ListProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(): Promise<ProductDto[]> {
    const rows = await this.products.listAll();
    return rows.map(toProductDto);
  }
}
