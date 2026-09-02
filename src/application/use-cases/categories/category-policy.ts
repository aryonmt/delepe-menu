import type { Category } from "@/domain/entities";
import { NotFoundError, ValidationError } from "@/domain/errors";
import type { CategoryRepository } from "@/domain/ports";

export async function requireCategory(
  categories: CategoryRepository,
  id: string,
): Promise<Category> {
  const category = await categories.findById(id);
  if (!category) {
    throw new NotFoundError();
  }
  return category;
}

/**
 * BR-01 (parent must be a root) and BR-16 (parent must not own products).
 */
export async function assertParentAllowsChild(
  categories: CategoryRepository,
  parentId: string,
): Promise<Category> {
  const parent = await requireCategory(categories, parentId);
  if (parent.parentId !== null) {
    throw new ValidationError("DEPTH_EXCEEDED");
  }
  if ((await categories.countProducts(parentId)) > 0) {
    throw new ValidationError("CATEGORY_HAS_PRODUCTS");
  }
  return parent;
}

/** BR-09: unique name among siblings, including top-level (NULL parent). */
export async function assertUniqueCategoryName(
  categories: CategoryRepository,
  parentId: string | null,
  name: string,
  excludeId?: string,
): Promise<void> {
  const existing = await categories.findByParentAndName(parentId, name);
  if (existing && existing.id !== excludeId) {
    throw new ValidationError("DUPLICATE_NAME");
  }
}
