import type { CategoryNode, ProductWithRelations, Settings } from "@/domain/entities";
import type {
  CategoryDto,
  MediaDto,
  ProductDto,
  SettingsDto,
  VariantDto,
} from "@/application/dtos";

export function toSettingsDto(settings: Settings): SettingsDto {
  return {
    restaurantName: settings.restaurantName,
    theme: settings.theme,
    unavailableMode: settings.unavailableMode,
  };
}

export function toProductDto(product: ProductWithRelations): ProductDto {
  const media: MediaDto | null = product.media
    ? {
        id: product.media.id,
        dominantColor: product.media.dominantColor,
        width: product.media.width,
        height: product.media.height,
      }
    : null;
  const variants: VariantDto[] = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    price: variant.price,
    sortOrder: variant.sortOrder,
  }));
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    discountedPrice: product.discountedPrice,
    discountActive: product.discountActive,
    isAvailable: product.isAvailable,
    badges: [...product.badges],
    sortOrder: product.sortOrder,
    categoryId: product.categoryId,
    variants,
    media,
  };
}

export function toCategoryDto(node: CategoryNode): CategoryDto {
  return {
    id: node.id,
    name: node.name,
    parentId: node.parentId,
    sortOrder: node.sortOrder,
    children: node.children.map(toCategoryDto),
    products: node.products.map(toProductDto),
  };
}
