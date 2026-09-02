import type { CategoryDto } from "@/application/dtos";
import { updateCategorySchema } from "@/application/schemas";
import { ValidationError } from "@/domain/errors";
import type { CategoryRepository } from "@/domain/ports";
import {
  assertParentAllowsChild,
  assertUniqueCategoryName,
  requireCategory,
} from "./category-policy";
import { toShallowCategoryDto } from "./to-shallow-category-dto";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** Updates a category; same depth/uniqueness/product-owner guards as create. */
export class UpdateCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: unknown): Promise<CategoryDto> {
    const data = parseOrThrow(updateCategorySchema, input);
    const existing = await requireCategory(this.categories, data.id);
    const parentId =
      data.parentId === undefined ? existing.parentId : data.parentId;
    if (parentId === data.id) {
      throw new ValidationError("VALIDATION");
    }
    if (parentId) {
      await assertParentAllowsChild(this.categories, parentId);
    }
    if (parentId !== null && (await this.categories.countChildren(data.id)) > 0) {
      throw new ValidationError("DEPTH_EXCEEDED");
    }
    await assertUniqueCategoryName(
      this.categories,
      parentId,
      data.name,
      data.id,
    );
    const updated = await this.categories.update(data.id, {
      name: data.name,
      parentId,
    });
    return toShallowCategoryDto(updated);
  }
}
