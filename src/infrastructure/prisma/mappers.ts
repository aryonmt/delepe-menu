import type {
  Category as PrismaCategory,
  Media as PrismaMedia,
  Product as PrismaProduct,
  ProductVariant as PrismaVariant,
  Settings as PrismaSettings,
} from "@prisma/client";
import type {
  BadgeKind,
  Category,
  CategoryNode,
  Media,
  ProductVariant,
  ProductWithRelations,
  Settings,
  ThemeName,
  UnavailableMode,
} from "@/domain/entities";

export function toMedia(row: PrismaMedia): Media {
  return {
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    dominantColor: row.dominantColor,
    path: row.path,
  };
}

export function toVariant(row: PrismaVariant): ProductVariant {
  return {
    id: row.id,
    productId: row.productId,
    name: row.name,
    price: row.price,
    sortOrder: row.sortOrder,
  };
}

export function toProduct(
  row: PrismaProduct & { variants: PrismaVariant[]; media: PrismaMedia | null },
): ProductWithRelations {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    discountedPrice: row.discountedPrice,
    discountActive: row.discountActive,
    isAvailable: row.isAvailable,
    sortOrder: row.sortOrder,
    badges: [...row.badges] as BadgeKind[],
    categoryId: row.categoryId,
    mediaId: row.mediaId,
    variants: row.variants.map(toVariant),
    media: row.media ? toMedia(row.media) : null,
  };
}

export function toCategory(row: PrismaCategory): Category {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    sortOrder: row.sortOrder,
  };
}

export function toSettings(row: PrismaSettings): Settings {
  return {
    id: 1,
    restaurantName: row.restaurantName,
    theme: row.theme as ThemeName,
    unavailableMode: row.unavailableMode as UnavailableMode,
  };
}

type PrismaCategoryTree = PrismaCategory & {
  children: Array<
    PrismaCategory & {
      products: Array<
        PrismaProduct & { variants: PrismaVariant[]; media: PrismaMedia | null }
      >;
    }
  >;
  products: Array<
    PrismaProduct & { variants: PrismaVariant[]; media: PrismaMedia | null }
  >;
};

export function toCategoryNode(row: PrismaCategoryTree): CategoryNode {
  return {
    ...toCategory(row),
    children: row.children.map((child) => ({
      ...toCategory(child),
      children: [],
      products: child.products.map(toProduct),
    })),
    products: row.products.map(toProduct),
  };
}

export const productInclude = {
  variants: { orderBy: { sortOrder: "asc" as const } },
  media: true,
} as const;
