import type {
  BadgeKind,
  ThemeName,
  UnavailableMode,
} from "@/domain/entities";

export type MediaDto = {
  id: string;
  dominantColor: string;
  width: number;
  height: number;
};

export type VariantDto = {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
};

export type ProductDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  discountActive: boolean;
  isAvailable: boolean;
  badges: BadgeKind[];
  sortOrder: number;
  categoryId: string;
  variants: VariantDto[];
  media: MediaDto | null;
};

export type CategoryDto = {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  children: CategoryDto[];
  products: ProductDto[];
};

export type SettingsDto = {
  restaurantName: string;
  theme: ThemeName;
  unavailableMode: UnavailableMode;
};

export type AdminMenuDto = {
  settings: SettingsDto;
  categories: CategoryDto[];
};

export type PublicMenuDto = {
  settings: SettingsDto;
  categories: CategoryDto[];
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; fa: string } };

export type UploadMediaResult = {
  mediaId: string;
  dominantColor: string;
  width: number;
  height: number;
};
