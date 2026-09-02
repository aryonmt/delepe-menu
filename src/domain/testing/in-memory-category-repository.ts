import type { Category, CategoryNode, CategoryWrite } from "../entities";
import type { CategoryRepository } from "../ports";
import type { InMemoryDatabase } from "./in-memory-database";

export class InMemoryCategoryRepository implements CategoryRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async findById(id: string): Promise<Category | null> {
    const row = this.db.categories.get(id);
    return row ? this.db.cloneCategory(row) : null;
  }

  async listByParent(parentId: string | null): Promise<Category[]> {
    return [...this.db.categories.values()]
      .filter((row) => row.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => this.db.cloneCategory(row));
  }

  async findByParentAndName(
    parentId: string | null,
    name: string,
  ): Promise<Category | null> {
    const row = [...this.db.categories.values()].find(
      (item) => item.parentId === parentId && item.name === name,
    );
    return row ? this.db.cloneCategory(row) : null;
  }

  async countChildren(id: string): Promise<number> {
    return [...this.db.categories.values()].filter((row) => row.parentId === id)
      .length;
  }

  async countProducts(id: string): Promise<number> {
    return [...this.db.products.values()].filter((row) => row.categoryId === id)
      .length;
  }

  async findTree(): Promise<CategoryNode[]> {
    const roots = await this.listByParent(null);
    return Promise.all(roots.map((root) => this.toNode(root)));
  }

  async create(input: CategoryWrite, sortOrder: number): Promise<Category> {
    const row: Category = {
      id: this.db.nextId("cat"),
      name: input.name,
      parentId: input.parentId,
      sortOrder,
    };
    this.db.categories.set(row.id, row);
    return this.db.cloneCategory(row);
  }

  async update(id: string, input: CategoryWrite): Promise<Category> {
    const existing = this.db.categories.get(id);
    if (!existing) {
      throw new Error(`Category ${id} missing`);
    }
    const row: Category = {
      ...existing,
      name: input.name,
      parentId: input.parentId,
    };
    this.db.categories.set(id, row);
    return this.db.cloneCategory(row);
  }

  async delete(id: string): Promise<void> {
    this.db.categories.delete(id);
  }

  async reorder(
    items: ReadonlyArray<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    for (const item of items) {
      const row = this.db.categories.get(item.id);
      if (!row) {
        continue;
      }
      this.db.categories.set(item.id, { ...row, sortOrder: item.sortOrder });
    }
  }

  private async toNode(category: Category): Promise<CategoryNode> {
    const childRows = await this.listByParent(category.id);
    const children = await Promise.all(childRows.map((child) => this.toNode(child)));
    const products = [...this.db.products.values()]
      .filter((row) => row.categoryId === category.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => {
        const cloned = this.db.cloneProduct(row);
        const media = cloned.mediaId
          ? (this.db.media.get(cloned.mediaId) ?? null)
          : null;
        return {
          ...cloned,
          media: media ? this.db.cloneMedia(media) : null,
        };
      });
    return { ...category, children, products };
  }
}
