import { ChangePasswordUseCase } from "@/application/use-cases/auth/change-password";
import { LoginUseCase } from "@/application/use-cases/auth/login";
import { LogoutUseCase } from "@/application/use-cases/auth/logout";
import { VerifySessionUseCase } from "@/application/use-cases/auth/verify-session";
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
import { Argon2PasswordHasher } from "@/infrastructure/auth/password";
import { InMemoryLoginRateLimiter } from "@/infrastructure/auth/rate-limiter";
import { JoseSessionSigner } from "@/infrastructure/auth/session";
import { SharpImageOptimizer } from "@/infrastructure/image/optimizer";
import { prisma } from "@/infrastructure/prisma/client";
import { PrismaAdminUserRepository } from "@/infrastructure/prisma/repositories/admin-user-repository";
import { PrismaCategoryRepository } from "@/infrastructure/prisma/repositories/category-repository";
import { PrismaProductRepository } from "@/infrastructure/prisma/repositories/product-repository";
import {
  PrismaMediaRepository,
  PrismaSettingsRepository,
} from "@/infrastructure/prisma/repositories/settings-media-repository";
import { LocalDiskStorage } from "@/infrastructure/storage/local-disk-storage";
import { env } from "@/lib/env";

const categoryRepo = new PrismaCategoryRepository(prisma);
const productRepo = new PrismaProductRepository(prisma);
const settingsRepo = new PrismaSettingsRepository(prisma);
const mediaRepo = new PrismaMediaRepository(prisma);
const adminUsers = new PrismaAdminUserRepository(prisma);
const storage = new LocalDiskStorage();
const optimizer = new SharpImageOptimizer();
const hasher = new Argon2PasswordHasher();
const sessions = new JoseSessionSigner(env.SESSION_SECRET);

const globalForAuth = globalThis as unknown as {
  loginLimiter?: InMemoryLoginRateLimiter;
};

/** One bucket store per process — Next may evaluate this module more than once. */
const loginLimiter =
  globalForAuth.loginLimiter ?? new InMemoryLoginRateLimiter();
globalForAuth.loginLimiter = loginLimiter;

function masterFromEnv() {
  if (env.MASTER_USERNAME && env.MASTER_PASSWORD) {
    return { username: env.MASTER_USERNAME, password: env.MASTER_PASSWORD };
  }
  return null;
}

/**
 * Composition root. Server actions obtain use-cases only through these factories.
 */
export const container = {
  getAdminMenu: () => new GetAdminMenuUseCase(categoryRepo, settingsRepo),
  getPublicMenu: () => new GetPublicMenuUseCase(container.getAdminMenu()),
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
  login: () =>
    new LoginUseCase(adminUsers, hasher, sessions, loginLimiter, {
      master: masterFromEnv(),
    }),
  logout: () => new LogoutUseCase(),
  changePassword: () => new ChangePasswordUseCase(adminUsers, hasher),
  verifySession: () => new VerifySessionUseCase(sessions),
};

export type Container = typeof container;
