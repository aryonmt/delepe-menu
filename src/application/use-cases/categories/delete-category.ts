import { deleteCategorySchema } from "@/application/schemas";
import { CategoryNotEmptyError } from "@/domain/errors";
import type { CategoryRepository } from "@/domain/ports";
import { requireCategory } from "./category-policy";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** BR-02: refuse to delete a category that still has children or products. */
export class DeleteCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: unknown): Promise<void> {
    const { id } = parseOrThrow(deleteCategorySchema, input);
    await requireCategory(this.categories, id);
    const [children, products] = await Promise.all([
      this.categories.countChildren(id),
      this.categories.countProducts(id),
    ]);
    if (children > 0 || products > 0) {
      throw new CategoryNotEmptyError();
    }
    await this.categories.delete(id);
  }
}
