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

/**
 * BR-13 auto min-price, BR-14 no discount with variants, BR-04 discount bounds.
 */
export function resolveProductWrite(
  input: CreateProductInput | UpdateProductInput,
): ProductWrite {
  const variants = input.variants;
  if (variants.length > 0) {
    const hasDiscount =
      input.discountActive === true || input.discountedPrice != null;
    if (hasDiscount) {
      throw new ValidationError("DISCOUNT_WITH_VARIANTS");
    }
    const price = Math.min(...variants.map((variant) => variant.price));
    return toWrite(input, price, null, false);
  }

  const price = input.price;
  if (price === undefined) {
    throw new ValidationError("VALIDATION");
  }
  const discountedPrice = input.discountedPrice ?? null;
  if (discountedPrice !== null && discountedPrice >= price) {
    throw new ValidationError("INVALID_DISCOUNT");
  }
  if (input.discountActive && discountedPrice === null) {
    throw new ValidationError("INVALID_DISCOUNT");
  }
  if (discountedPrice !== null && discountedPrice < PRICE_MIN_TOMAN) {
    throw new ValidationError("INVALID_DISCOUNT");
  }
  return toWrite(input, price, discountedPrice, input.discountActive);
}

function toWrite(
  input: CreateProductInput | UpdateProductInput,
  price: number,
  discountedPrice: number | null,
  discountActive: boolean,
): ProductWrite {
  return {
    name: input.name,
    description: input.description ?? null,
    price,
    discountedPrice,
    discountActive,
    isAvailable: input.isAvailable,
    badges: [...input.badges],
    categoryId: input.categoryId,
    mediaId: input.mediaId ?? null,
    variants: variantsOf(input),
  };
}

function variantsOf(
  input: CreateProductInput | UpdateProductInput,
): ProductWrite["variants"] {
  return input.variants.map((variant) => ({
    name: variant.name,
    price: variant.price,
  }));
}
