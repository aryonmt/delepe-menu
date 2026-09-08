import { mkdir } from "node:fs/promises";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import { SharpImageOptimizer } from "@/infrastructure/image/optimizer";
import { prisma } from "@/infrastructure/prisma/client";
import { LocalDiskStorage } from "@/infrastructure/storage/local-disk-storage";
import { env } from "@/lib/env";
import { childCategories, groups, topLevelCategories, type SeedProduct } from "./seed-data";

const CHAPTER_HUES = ["#C89B54", "#8FB8CC", "#C77DBB", "#D96C4A", "#E8763D", "#7FC8A9"];

function hueForCategory(categoryName: string): string {
  let hash = 0;
  for (const char of categoryName) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return CHAPTER_HUES[hash % CHAPTER_HUES.length] ?? "#C89B54";
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function deterministicSvg(productName: string, categoryName: string): string {
  const hue = hueForCategory(categoryName);
  const initial = [...productName][0] ?? "✦";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1A120B"/><stop offset="55%" stop-color="#120C07"/><stop offset="100%" stop-color="#0D0A07"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${hue}" stop-opacity="0.22"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)"/>
    <circle cx="400" cy="360" r="230" fill="url(#glow)"/>
    <circle cx="400" cy="360" r="95" fill="#1F1811" stroke="${hue}" stroke-width="2" stroke-opacity="0.5"/>
    <text x="400" y="392" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="78" fill="${hue}">${escapeXml(initial)}</text>
    <text x="400" y="555" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="32" fill="#F5EBDD">${escapeXml(productName)}</text>
    <text x="400" y="602" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#A8947F">${escapeXml(categoryName)}</text>
    <text x="400" y="720" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#E8A33D" opacity="0.75">${escapeXml("دِ‌لِ‌پِ")}</text>
  </svg>`;
}

async function main() {
  await mkdir(path.join(env.STORAGE_ROOT, "uploads"), { recursive: true });
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, restaurantName: "دِ‌لِ‌پِ", theme: "WARM_HONEY", unavailableMode: "MUTED" },
    update: { restaurantName: "دِ‌لِ‌پِ", theme: "WARM_HONEY", unavailableMode: "MUTED" },
  });

  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0 && env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const passwordHash = await hash(env.ADMIN_PASSWORD);
    await prisma.adminUser.create({ data: { username: env.ADMIN_USERNAME, passwordHash } });
  }

  const categoryByName = new Map<string, string>();
  for (const top of topLevelCategories) {
    const existing = await prisma.category.findFirst({ where: { name: top.name, parentId: null } });
    const row = existing
      ? await prisma.category.update({ where: { id: existing.id }, data: { sortOrder: top.sortOrder } })
      : await prisma.category.create({ data: { name: top.name, parentId: null, sortOrder: top.sortOrder } });
    categoryByName.set(top.name, row.id);
  }

  for (const child of childCategories) {
    const parentId = categoryByName.get(child.parent);
    if (!parentId) throw new Error(`Missing parent ${child.parent}`);
    const existing = await prisma.category.findFirst({ where: { name: child.name, parentId } });
    const row = existing
      ? await prisma.category.update({ where: { id: existing.id }, data: { sortOrder: child.sortOrder } })
      : await prisma.category.create({ data: { name: child.name, parentId, sortOrder: child.sortOrder } });
    categoryByName.set(child.name, row.id);
  }

  const optimizer = new SharpImageOptimizer();
  const storage = new LocalDiskStorage();
  let sortCounter = 0;

  for (const group of groups) {
    const categoryId = categoryByName.get(group.category);
    if (!categoryId) throw new Error(`Missing category ${group.category}`);

    for (const product of group.products) {
      sortCounter += 10;
      const { price, variants } = productPricing(product);
      const badges = product.badges ?? [];
      const isAvailable = product.isAvailable ?? true;
      const existing = await prisma.product.findFirst({ where: { categoryId, name: product.name } });
      let productId: string;
      let existingMediaId: string | null = null;

      if (existing) {
        existingMediaId = existing.mediaId;
        await prisma.product.update({
          where: { id: existing.id },
          data: { description: product.description, price, discountedPrice: product.discountedPrice ?? null, discountActive: product.discountActive ?? false, isAvailable, sortOrder: sortCounter, badges: { set: badges } },
        });
        productId = existing.id;
        await prisma.productVariant.deleteMany({ where: { productId } });
      } else {
        const created = await prisma.product.create({
          data: { name: product.name, description: product.description, price, discountedPrice: product.discountedPrice ?? null, discountActive: product.discountActive ?? false, isAvailable, sortOrder: sortCounter, badges, categoryId },
        });
        productId = created.id;
      }

      for (const variant of variants) {
        await prisma.productVariant.create({ data: { productId, name: variant.name, price: variant.price, sortOrder: variant.sortOrder } });
      }

      if (existingMediaId) {
        const mediaRow = await prisma.media.findUnique({ where: { id: existingMediaId } });
        await storage.deleteAll(existingMediaId);
        if (mediaRow) await prisma.media.delete({ where: { id: existingMediaId } });
      }

      // Fully offline deterministic SVG
      const svg = deterministicSvg(product.name, group.category);
      const bytes = new TextEncoder().encode(svg);
      const stored = await optimizer.process({ bytes, mimeType: "image/svg+xml", width: 800, height: 800 });
      
      await prisma.media.create({
        data: { id: stored.mediaId, fileName: stored.fileName, mimeType: stored.mimeType, width: stored.width, height: stored.height, dominantColor: stored.dominantColor, path: stored.path },
      });
      await prisma.product.update({ where: { id: productId }, data: { mediaId: stored.mediaId } });
    }
  }
  console.log("✨ Seed completed with «پاتوق» placeholders");
}

function productPricing(product: SeedProduct): { price: number; variants: { name: string; price: number; sortOrder: number }[] } {
  const small = product.small;
  const large = product.large;
  const hasVariants = small != null && large != null;
  if (hasVariants) {
    return {
      price: Math.min(small!, large!),
      variants: [
        { name: "سایز کوچک", price: small!, sortOrder: 10 },
        { name: "سایز بزرگ", price: large!, sortOrder: 20 },
      ],
    };
  }
  const unitPrice = product.price;
  if (unitPrice == null) throw new Error(`Seed product "${product.name}" needs price or small/large`);
  return { price: unitPrice, variants: [] };
}

main().catch((error: unknown) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });