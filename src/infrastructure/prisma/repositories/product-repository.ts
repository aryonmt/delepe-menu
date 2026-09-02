import type { PrismaClient } from "@prisma/client";
import type { Product, ProductWithRelations, ProductWrite } from "@/domain/entities";
import type { ProductRepository } from "@/domain/ports";
import { SORT_ORDER_GAP } from "@/lib/constants";
import { productInclude, toProduct } from "../mappers";

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ProductWithRelations | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    return row ? toProduct(row) : null;
  }

  async listAll(): Promise<ProductWithRelations[]> {
    const rows = await this.prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
      include: productInclude,
    });
    return rows.map(toProduct);
  }

  async listByCategory(categoryId: string): Promise<ProductWithRelations[]> {
    const rows = await this.prisma.product.findMany({
      where: { categoryId },
      orderBy: { sortOrder: "asc" },
      include: productInclude,
    });
    return rows.map(toProduct);
  }

  async findByCategoryAndName(
    categoryId: string,
    name: string,
  ): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({
      where: { categoryId, name },
      include: productInclude,
    });
    if (!row) {
      return null;
    }
    const mapped = toProduct(row);
    return {
      id: mapped.id,
      name: mapped.name,
      description: mapped.description,
      price: mapped.price,
      discountedPrice: mapped.discountedPrice,
      discountActive: mapped.discountActive,
      isAvailable: mapped.isAvailable,
      sortOrder: mapped.sortOrder,
      badges: mapped.badges,
      categoryId: mapped.categoryId,
      mediaId: mapped.mediaId,
    };
  }

  async create(
    input: ProductWrite,
    sortOrder: number,
  ): Promise<ProductWithRelations> {
    const row = await this.prisma.product.create({
      data: {
        ...scalarData(input),
        sortOrder,
        variants: {
          create: input.variants.map((variant, index) => ({
            name: variant.name,
            price: variant.price,
            sortOrder: (index + 1) * SORT_ORDER_GAP,
          })),
        },
      },
      include: productInclude,
    });
    return toProduct(row);
  }

  async update(id: string, input: ProductWrite): Promise<ProductWithRelations> {
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...scalarData(input),
          variants: {
            create: input.variants.map((variant, index) => ({
              name: variant.name,
              price: variant.price,
              sortOrder: (index + 1) * SORT_ORDER_GAP,
            })),
          },
        },
        include: productInclude,
      });
    });
    return toProduct(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async reorder(
    items: ReadonlyArray<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.product.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }
}

function scalarData(input: ProductWrite) {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    discountedPrice: input.discountedPrice,
    discountActive: input.discountActive,
    isAvailable: input.isAvailable,
    badges: input.badges,
    categoryId: input.categoryId,
    mediaId: input.mediaId,
  };
}
