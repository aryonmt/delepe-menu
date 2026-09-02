import type {
  AdminMenuDto,
  CategoryDto,
  ProductDto,
  PublicMenuDto,
} from "@/application/dtos";

/**
 * Pure BR-08 mapper: HIDE drops unavailable products; MUTED keeps them;
 * categories with zero remaining visible products are pruned.
 * Never mutates `input`.
 */
export function toPublicMenu(input: AdminMenuDto): PublicMenuDto {
  const hideUnavailable = input.settings.unavailableMode === "HIDE";
  const categories = input.categories
    .map((category) => filterCategory(category, hideUnavailable))
    .filter(hasVisibleProducts);
  return {
    settings: { ...input.settings },
    categories,
  };
}

function filterCategory(
  category: CategoryDto,
  hideUnavailable: boolean,
): CategoryDto {
  const visible = hideUnavailable
    ? category.products.filter((product) => product.isAvailable)
    : category.products;
  const children = category.children
    .map((child) => filterCategory(child, hideUnavailable))
    .filter(hasVisibleProducts);
  return {
    id: category.id,
    name: category.name,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    products: visible.map(cloneProduct),
    children,
  };
}

function hasVisibleProducts(category: CategoryDto): boolean {
  return (
    category.products.length > 0 ||
    category.children.some(hasVisibleProducts)
  );
}

function cloneProduct(product: ProductDto): ProductDto {
  return {
    ...product,
    badges: [...product.badges],
    variants: product.variants.map((variant) => ({ ...variant })),
    media: product.media ? { ...product.media } : null,
  };
}
