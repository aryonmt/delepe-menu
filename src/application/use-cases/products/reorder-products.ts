import { reorderProductsSchema } from "@/application/schemas";
import type { ProductRepository } from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";
import { assertSameIdSet, gapItems } from "@/application/use-cases/shared/sort";

/** BR-07: persist product order within a category as 10, 20, 30, … */
export class ReorderProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: unknown): Promise<void> {
    const data = parseOrThrow(reorderProductsSchema, input);
    const siblings = await this.products.listByCategory(data.categoryId);
    assertSameIdSet(
      siblings.map((row) => row.id),
      data.orderedIds,
    );
    await this.products.reorder(gapItems(data.orderedIds));
  }
}
