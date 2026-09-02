import type { PrismaClient } from "@prisma/client";
import type { Category, CategoryNode, CategoryWrite } from "@/domain/entities";
import type { CategoryRepository } from "@/domain/ports";
import { productInclude, toCategory, toCategoryNode } from "../mappers";

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    return row ? toCategory(row) : null;
  }

  async listByParent(parentId: string | null): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      where: { parentId },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(toCategory);
  }

  async findByParentAndName(
    parentId: string | null,
    name: string,
  ): Promise<Category | null> {
    const row = await this.prisma.category.findFirst({
      where: { parentId, name },
    });
    return row ? toCategory(row) : null;
  }

  async countChildren(id: string): Promise<number> {
    return this.prisma.category.count({ where: { parentId: id } });
  }

  async countProducts(id: string): Promise<number> {
    return this.prisma.product.count({ where: { categoryId: id } });
  }

  async findTree(): Promise<CategoryNode[]> {
    const rows = await this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            products: {
              orderBy: { sortOrder: "asc" },
              include: productInclude,
            },
          },
        },
        products: {
          orderBy: { sortOrder: "asc" },
          include: productInclude,
        },
      },
    });
    return rows.map(toCategoryNode);
  }

  async create(input: CategoryWrite, sortOrder: number): Promise<Category> {
    const row = await this.prisma.category.create({
      data: { name: input.name, parentId: input.parentId, sortOrder },
    });
    return toCategory(row);
  }

  async update(id: string, input: CategoryWrite): Promise<Category> {
    const row = await this.prisma.category.update({
      where: { id },
      data: { name: input.name, parentId: input.parentId },
    });
    return toCategory(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  async reorder(
    items: ReadonlyArray<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }
}
