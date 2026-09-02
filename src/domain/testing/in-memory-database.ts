import type {
  BadgeKind,
  Category,
  Media,
  Product,
  ProductVariant,
  Settings,
} from "../entities";

export type CategoryRecord = Category;
export type MediaRecord = Media;
export type VariantRecord = ProductVariant;
export type ProductRecord = Product & { variants: VariantRecord[] };

/** Shared in-memory store so every fake sees the same graph. */
export class InMemoryDatabase {
  readonly categories = new Map<string, CategoryRecord>();
  readonly products = new Map<string, ProductRecord>();
  readonly media = new Map<string, MediaRecord>();
  settings: Settings | null = null;
  readonly deletedMediaFiles: string[] = [];
  private seq = 0;

  nextId(prefix: string): string {
    this.seq += 1;
    return `${prefix}_${this.seq}`;
  }

  cloneCategory(row: CategoryRecord): Category {
    return { ...row };
  }

  cloneMedia(row: MediaRecord): Media {
    return { ...row };
  }

  cloneProduct(row: ProductRecord): ProductRecord {
    return {
      ...row,
      badges: [...row.badges] as BadgeKind[],
      variants: row.variants.map((variant) => ({ ...variant })),
    };
  }
}
