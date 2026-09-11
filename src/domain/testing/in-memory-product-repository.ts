import type {
  Product,
  ProductWithRelations,
  ProductWrite,
} from "../entities";
import type { ProductRepository } from "../ports";
import type { InMemoryDatabase, ProductRecord } from "./in-memory-database";

export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async findById(id: string): Promise<ProductWithRelations | null> {
    const row = this.db.products.get(id);
    return row ? this.toRelations(row) : null;
  }

  async listAll(): Promise<ProductWithRelations[]> {
    return [...this.db.products.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => this.toRelations(row));
  }

  async listByCategory(categoryId: string): Promise<ProductWithRelations[]> {
    return [...this.db.products.values()]
      .filter((row) => row.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => this.toRelations(row));
  }

  async findByCategoryAndName(
    categoryId: string,
    name: string,
  ): Promise<Product | null> {
    const row = [...this.db.products.values()].find(
      (item) => item.categoryId === categoryId && item.name === name,
    );
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      discountedPrice: row.discountedPrice,
      discountActive: row.discountActive,
      isAvailable: row.isAvailable,
      sortOrder: row.sortOrder,
      badges: [...row.badges],
      categoryId: row.categoryId,
      mediaId: row.mediaId,
    };
  }

  async create(
    input: ProductWrite,
    sortOrder: number,
  ): Promise<ProductWithRelations> {
    const id = this.db.nextId("prod");
    const row = this.buildRecord(id, input, sortOrder);
    this.db.products.set(id, row);
    return this.toRelations(row);
  }

  async update(id: string, input: ProductWrite): Promise<ProductWithRelations> {
    const existing = this.db.products.get(id);
    if (!existing) {
      throw new Error(`Product ${id} missing`);
    }
    const row = this.buildRecord(id, input, existing.sortOrder);
    this.db.products.set(id, row);
    return this.toRelations(row);
  }

  async delete(id: string): Promise<void> {
    this.db.products.delete(id);
  }

  async reorder(
    items: ReadonlyArray<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    for (const item of items) {
      const row = this.db.products.get(item.id);
      if (!row) {
        continue;
      }
      this.db.products.set(item.id, { ...row, sortOrder: item.sortOrder });
    }
  }

  private buildRecord(
    id: string,
    input: ProductWrite,
    sortOrder: number,
  ): ProductRecord {
    return {
      id,
      name: input.name,
      description: input.description,
      price: input.price,
      discountedPrice: input.discountedPrice,
      discountActive: input.discountActive,
      isAvailable: input.isAvailable,
      sortOrder,
      badges: [...input.badges],
      categoryId: input.categoryId,
      mediaId: input.mediaId,
      variants: input.variants.map((variant, index) => ({
        id: this.db.nextId("var"),
        productId: id,
        name: variant.name,
        price: variant.price,
        discountedPrice: variant.discountedPrice,
        discountActive: variant.discountActive,
        isAvailable: variant.isAvailable,
        sortOrder: (index + 1) * 10,
      })),
    };
  }

  private toRelations(row: ProductRecord): ProductWithRelations {
    const cloned = this.db.cloneProduct(row);
    const media = cloned.mediaId
      ? (this.db.media.get(cloned.mediaId) ?? null)
      : null;
    return {
      ...cloned,
      media: media ? this.db.cloneMedia(media) : null,
    };
  }
}
