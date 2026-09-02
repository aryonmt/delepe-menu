import { InMemoryAdminUserRepository } from "./in-memory-admin-user-repository";
import { InMemoryCategoryRepository } from "./in-memory-category-repository";
import { InMemoryDatabase } from "./in-memory-database";
import { InMemoryProductRepository } from "./in-memory-product-repository";
import {
  InMemoryImageOptimizer,
  InMemoryMediaRepository,
  InMemoryMediaStorage,
  InMemorySettingsRepository,
} from "./in-memory-settings-media";

/** Wires every in-memory port to one shared database (unit-test composition). */
export function createInMemoryRepos() {
  const db = new InMemoryDatabase();
  return {
    db,
    categories: new InMemoryCategoryRepository(db),
    products: new InMemoryProductRepository(db),
    settings: new InMemorySettingsRepository(db),
    media: new InMemoryMediaRepository(db),
    storage: new InMemoryMediaStorage(db),
    optimizer: new InMemoryImageOptimizer(db),
    adminUsers: new InMemoryAdminUserRepository(),
  };
}

export type InMemoryRepos = ReturnType<typeof createInMemoryRepos>;
