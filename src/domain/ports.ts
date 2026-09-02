import type {
  AdminUser,
  Category,
  CategoryNode,
  CategoryWrite,
  Media,
  Product,
  ProductWithRelations,
  ProductWrite,
  Settings,
  StoredImage,
  ThemeName,
  UnavailableMode,
} from "./entities";

/**
 * Category persistence. Uniqueness (BR-09) is *not* trusted to the unique index
 * because PostgreSQL treats NULL parentId as distinct.
 */
export interface CategoryReader {
  findById(id: string): Promise<Category | null>;
  /** Siblings under the same parent, including roots when `parentId` is null. */
  listByParent(parentId: string | null): Promise<Category[]>;
  findByParentAndName(
    parentId: string | null,
    name: string,
  ): Promise<Category | null>;
  countChildren(id: string): Promise<number>;
  countProducts(id: string): Promise<number>;
  /** Full two-level tree with products, variants, and media. */
  findTree(): Promise<CategoryNode[]>;
}

export interface CategoryWriter {
  create(input: CategoryWrite, sortOrder: number): Promise<Category>;
  update(id: string, input: CategoryWrite): Promise<Category>;
  delete(id: string): Promise<void>;
  /** Persist caller-computed sort orders (BR-07 gaps live in the use-case). */
  reorder(items: ReadonlyArray<{ id: string; sortOrder: number }>): Promise<void>;
}

export type CategoryRepository = CategoryReader & CategoryWriter;

export interface ProductReader {
  findById(id: string): Promise<ProductWithRelations | null>;
  listAll(): Promise<ProductWithRelations[]>;
  listByCategory(categoryId: string): Promise<ProductWithRelations[]>;
  findByCategoryAndName(
    categoryId: string,
    name: string,
  ): Promise<Product | null>;
}

export interface ProductWriter {
  create(input: ProductWrite, sortOrder: number): Promise<ProductWithRelations>;
  update(id: string, input: ProductWrite): Promise<ProductWithRelations>;
  delete(id: string): Promise<void>;
  reorder(items: ReadonlyArray<{ id: string; sortOrder: number }>): Promise<void>;
}

export type ProductRepository = ProductReader & ProductWriter;

export interface SettingsReader {
  get(): Promise<Settings | null>;
}

export interface SettingsWriter {
  /** BR-10: always upserts the singleton row (id = 1). */
  upsert(input: {
    restaurantName: string;
    theme: ThemeName;
    unavailableMode: UnavailableMode;
  }): Promise<Settings>;
}

export type SettingsRepository = SettingsReader & SettingsWriter;

export interface MediaReader {
  findById(id: string): Promise<Media | null>;
}

export interface MediaWriter {
  create(input: Omit<Media, "id"> & { id: string }): Promise<Media>;
  delete(id: string): Promise<void>;
}

export type MediaRepository = MediaReader & MediaWriter;

/** Deletes the original plus the three WebP variants (BR-03). */
export interface MediaStorage {
  deleteAll(mediaId: string): Promise<void>;
}

/**
 * Turns validated upload bytes into stored files + dominant color.
 * Sharp implementation lands in M5; tests use an in-memory fake.
 */
export interface ImageOptimizer {
  process(input: {
    bytes: Uint8Array;
    mimeType: string;
    width: number;
    height: number;
  }): Promise<StoredImage>;
}

export interface AdminUserRepository {
  findById(id: string): Promise<AdminUser | null>;
  findByUsername(username: string): Promise<AdminUser | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  upsertByUsername(username: string, passwordHash: string): Promise<AdminUser>;
}

/** argon2id in production; fakes in unit tests. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(passwordHash: string, plain: string): Promise<boolean>;
}

/** HS256 JWT in production (`jose`); opaque tokens in unit tests. */
export interface SessionSigner {
  sign(adminId: string): Promise<string>;
  verify(token: string): Promise<{ adminId: string }>;
}

/** Failed-attempt window keyed by ip+username (docs/10). */
export interface LoginRateLimiter {
  assertAllowed(key: string): Promise<void>;
  recordFailure(key: string): Promise<void>;
  reset(key: string): Promise<void>;
}
