import { CreateCategoryUseCase } from "@/application/use-cases/categories/create-category";
import { DeleteCategoryUseCase } from "@/application/use-cases/categories/delete-category";
import { ListCategoriesUseCase } from "@/application/use-cases/categories/list-categories";
import { ReorderCategoriesUseCase } from "@/application/use-cases/categories/reorder-categories";
import { UpdateCategoryUseCase } from "@/application/use-cases/categories/update-category";
import { DeleteMediaUseCase } from "@/application/use-cases/media/delete-media";
import { UploadMediaUseCase } from "@/application/use-cases/media/upload-media";
import { GetAdminMenuUseCase } from "@/application/use-cases/menu/get-admin-menu";
import { GetPublicMenuUseCase } from "@/application/use-cases/menu/get-public-menu";
import { CreateProductUseCase } from "@/application/use-cases/products/create-product";
import { DeleteProductUseCase } from "@/application/use-cases/products/delete-product";
import { GetProductUseCase } from "@/application/use-cases/products/get-product";
import { ListProductsUseCase } from "@/application/use-cases/products/list-products";
import { ReorderProductsUseCase } from "@/application/use-cases/products/reorder-products";
import { UpdateProductUseCase } from "@/application/use-cases/products/update-product";
import { GetSettingsUseCase } from "@/application/use-cases/settings/get-settings";
import { UpdateSettingsUseCase } from "@/application/use-cases/settings/update-settings";
import { PassthroughImageOptimizer } from "@/infrastructure/image/optimizer";
import { prisma } from "@/infrastructure/prisma/client";
import { PrismaCategoryRepository } from "@/infrastructure/prisma/repositories/category-repository";
import { PrismaProductRepository } from "@/infrastructure/prisma/repositories/product-repository";
import {
  PrismaMediaRepository,
  PrismaSettingsRepository,
} from "@/infrastructure/prisma/repositories/settings-media-repository";
import { LocalDiskStorage } from "@/infrastructure/storage/local-disk-storage";

const categoryRepo = new PrismaCategoryRepository(prisma);
const productRepo = new PrismaProductRepository(prisma);
const settingsRepo = new PrismaSettingsRepository(prisma);
const mediaRepo = new PrismaMediaRepository(prisma);
const storage = new LocalDiskStorage();
const optimizer = new PassthroughImageOptimizer();

/**
 * Composition root. Server actions obtain use-cases only through these factories.
 */
export const container = {
  getPublicMenu: () => new GetPublicMenuUseCase(categoryRepo, settingsRepo),
  getAdminMenu: () => new GetAdminMenuUseCase(categoryRepo, settingsRepo),
  listCategories: () => new ListCategoriesUseCase(categoryRepo),
  createCategory: () => new CreateCategoryUseCase(categoryRepo),
  updateCategory: () => new UpdateCategoryUseCase(categoryRepo),
  deleteCategory: () => new DeleteCategoryUseCase(categoryRepo),
  reorderCategories: () => new ReorderCategoriesUseCase(categoryRepo),
  listProducts: () => new ListProductsUseCase(productRepo),
  getProduct: () => new GetProductUseCase(productRepo),
  createProduct: () => new CreateProductUseCase(productRepo, categoryRepo),
  updateProduct: () =>
    new UpdateProductUseCase(productRepo, categoryRepo, mediaRepo, storage),
  deleteProduct: () =>
    new DeleteProductUseCase(productRepo, mediaRepo, storage),
  reorderProducts: () => new ReorderProductsUseCase(productRepo),
  getSettings: () => new GetSettingsUseCase(settingsRepo),
  updateSettings: () => new UpdateSettingsUseCase(settingsRepo),
  uploadMedia: () => new UploadMediaUseCase(optimizer, mediaRepo),
  deleteMedia: () => new DeleteMediaUseCase(mediaRepo, storage),
};

export type Container = typeof container;
