import { describe, expect, it } from "vitest";
import { prisma } from "../client";
import { PrismaAdminUserRepository } from "./admin-user-repository";
import { PrismaCategoryRepository } from "./category-repository";
import { PrismaProductRepository } from "./product-repository";
import {
  PrismaMediaRepository,
  PrismaSettingsRepository,
} from "./settings-media-repository";

describe("Prisma repositories", () => {
  it("constructs every port implementation (smoke)", () => {
    expect(new PrismaCategoryRepository(prisma)).toBeDefined();
    expect(new PrismaProductRepository(prisma)).toBeDefined();
    expect(new PrismaSettingsRepository(prisma)).toBeDefined();
    expect(new PrismaMediaRepository(prisma)).toBeDefined();
    expect(new PrismaAdminUserRepository(prisma)).toBeDefined();
  });
});
