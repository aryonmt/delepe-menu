import type { ProductDto } from "@/application/dtos";
import type { UpdateProductInput } from "@/application/schemas";

/**
 * Maps a public/admin ProductDto back into UpdateProductInput.
 * ProductDto has `media` not `mediaId`; spreading the DTO would drop the image.
 */
export function productDtoToUpdateInput(
  product: ProductDto,
  patch: Partial<Pick<UpdateProductInput, "isAvailable">> = {},
): UpdateProductInput {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    discountedPrice: product.discountedPrice,
    discountActive: product.discountActive,
    isAvailable: patch.isAvailable ?? product.isAvailable,
    badges: [...product.badges],
    categoryId: product.categoryId,
    mediaId: product.media?.id ?? null,
    variants: product.variants.map((variant) => ({
      name: variant.name,
      price: variant.price,
    })),
  };
}
