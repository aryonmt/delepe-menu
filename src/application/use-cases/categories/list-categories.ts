import type { CategoryDto } from "@/application/dtos";
import { toCategoryDto } from "@/application/mappers/to-dto";
import type { CategoryRepository } from "@/domain/ports";

/** Full category tree with nested products (admin, unfiltered). */
export class ListCategoriesUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(): Promise<CategoryDto[]> {
    const tree = await this.categories.findTree();
    return tree.map(toCategoryDto);
  }
}
