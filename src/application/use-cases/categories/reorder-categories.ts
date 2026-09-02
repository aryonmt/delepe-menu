import { reorderCategoriesSchema } from "@/application/schemas";
import type { CategoryRepository } from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";
import { assertSameIdSet, gapItems } from "@/application/use-cases/shared/sort";

/** BR-07: persist sibling order as 10, 20, 30, … */
export class ReorderCategoriesUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: unknown): Promise<void> {
    const data = parseOrThrow(reorderCategoriesSchema, input);
    const siblings = await this.categories.listByParent(data.parentId);
    assertSameIdSet(
      siblings.map((row) => row.id),
      data.orderedIds,
    );
    await this.categories.reorder(gapItems(data.orderedIds));
  }
}
