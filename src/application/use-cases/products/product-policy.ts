import type { ProductWrite } from "@/domain/entities";
import { NotFoundError, ValidationError } from "@/domain/errors";
import type { CategoryRepository, ProductRepository } from "@/domain/ports";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/application/schemas";
import { PRICE_MIN_TOMAN } from "@/lib/constants";

export async function requireLeafCategory(
  categories: CategoryRepository,
  categoryId: string,
): Promise<void> {
  const category = await categories.findById(categoryId);
  if (!category) {
    throw new NotFoundError();
  }
  if ((await categories.countChildren(categoryId)) > 0) {
    throw new ValidationError("NOT_LEAF_CATEGORY");
  }
}

export async function assertUniqueProductName(
  products: ProductRepository,
  categoryId: string,
  name: string,
  excludeId?: string,
): Promise<void> {
  const existing = await products.findByCategoryAndName(categoryId, name);
  if (existing && existing.id !== excludeId) {
    throw new ValidationError("DUPLICATE_NAME");
  }
}

function assertDiscount(
  price: number,
  discountedPrice: number | null,
  discountActive: boolean,
): void {
  if (discountedPrice !== null && discountedPrice >= price) {
    throw new ValidationError("INVALID_DISCOUNT");
  }
  if (discountActive && discountedPrice === null) {
    throw new ValidationError("INVALID_DISCOUNT");
  }
  if (discountedPrice !== null && discountedPrice < PRICE_MIN_TOMAN) {
    throw new ValidationError("INVALID_DISCOUNT");
  }
}

/**
 * BR-13: owner-entered base price is kept.
 * BR-14: base and each variant may have their own discount (BR-04 bounds).
 */
export function resolveProductWrite(
  input: CreateProductInput | UpdateProductInput,
): ProductWrite {
  const variants = input.variants;
  const names = variants.map((variant) => variant.name.trim());
  if (new Set(names).size !== names.length) {
    throw new ValidationError("DUPLICATE_NAME");
  }
  const price = input.price;
  const discountedPrice = input.discountedPrice ?? null;
  assertDiscount(price, discountedPrice, input.discountActive);
  for (const variant of variants) {
    assertDiscount(
      variant.price,
      variant.discountedPrice ?? null,
      variant.discountActive,
    );
  }
  return {
    name: input.name,
    description: input.description ?? null,
    price,
    discountedPrice,
    discountActive: input.discountActive,
    isAvailable: input.isAvailable,
    badges: [...input.badges],
    categoryId: input.categoryId,
    mediaId: input.mediaId ?? null,
    variants: variants.map((variant) => ({
      name: variant.name,
      price: variant.price,
      discountedPrice: variant.discountedPrice ?? null,
      discountActive: variant.discountActive,
      isAvailable: variant.isAvailable ?? true,
    })),
  };
}
