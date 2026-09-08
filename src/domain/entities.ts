// src/domain/entities.ts
/** Domain entities. Pure types — no Prisma, no framework, no other layers. */
export const BADGE_KINDS = ["POPULAR", "NEW", "SPICY", "VEGETARIAN"] as const;
export type BadgeKind = (typeof BADGE_KINDS)[number];
export const THEME_NAMES = [
  "WARM_HONEY",
  "MIDNIGHT_GOLD",
  "IVORY_MINIMAL",
  "DEEP_EMERALD",
] as const;
export type ThemeName = (typeof THEME_NAMES)[number];
export const UNAVAILABLE_MODES = ["HIDE", "MUTED"] as const;
export type UnavailableMode = (typeof UNAVAILABLE_MODES)[number];
export type Media = {
  id: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  dominantColor: string;
  path: string;
};
export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  price: number;
  sortOrder: number;
};
export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  discountActive: boolean;
  isAvailable: boolean;
  sortOrder: number;
  badges: BadgeKind[];
  categoryId: string;
  mediaId: string | null;
};
export type ProductWithRelations = Product & {
  variants: ProductVariant[];
  media: Media | null;
};
export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
};
/** Two-level tree node used by menu loaders. */
export type CategoryNode = Category & {
  children: CategoryNode[];
  products: ProductWithRelations[];
};
export type Settings = {
  id: 1;
  restaurantName: string;
  theme: ThemeName;
  unavailableMode: UnavailableMode;
  /** Admin-curated hero ticker order; empty = automatic chapter-order fill. */
  tickerProductIds: string[];
};
export type VariantWrite = { name: string; price: number };
export type ProductWrite = {
  name: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  discountActive: boolean;
  isAvailable: boolean;
  badges: BadgeKind[];
  categoryId: string;
  mediaId: string | null;
  variants: VariantWrite[];
};
export type CategoryWrite = { name: string; parentId: string | null };
export type StoredImage = {
  mediaId: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  dominantColor: string;
  path: string;
};
export type AdminUser = {
  id: string;
  username: string;
  passwordHash: string;
};