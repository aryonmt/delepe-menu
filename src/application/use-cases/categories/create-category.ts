import type { CategoryDto } from "@/application/dtos";
import { createCategorySchema } from "@/application/schemas";
import type { CategoryRepository } from "@/domain/ports";
import {
  assertParentAllowsChild,
  assertUniqueCategoryName,
} from "./category-policy";
import { toShallowCategoryDto } from "./to-shallow-category-dto";
import { parseOrThrow } from "@/application/use-cases/shared/parse";
import { nextSortOrder } from "@/application/use-cases/shared/sort";

/** Creates a category after BR-01 / BR-09 / BR-16 guards. */
export class CreateCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: unknown): Promise<CategoryDto> {
    const data = parseOrThrow(createCategorySchema, input);
    const parentId = data.parentId ?? null;
    if (parentId) {
      await assertParentAllowsChild(this.categories, parentId);
    }
    await assertUniqueCategoryName(this.categories, parentId, data.name);
    const siblings = await this.categories.listByParent(parentId);
    const created = await this.categories.create(
      { name: data.name, parentId },
      nextSortOrder(siblings),
    );
    return toShallowCategoryDto(created);
  }
}
