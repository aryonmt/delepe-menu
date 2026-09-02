import type { Category } from "@/domain/entities";
import type { CategoryDto } from "@/application/dtos";

export function toShallowCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    children: [],
    products: [],
  };
}
