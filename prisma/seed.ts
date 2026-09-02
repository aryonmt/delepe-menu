import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import { SharpImageOptimizer } from "@/infrastructure/image/optimizer";
import { prisma } from "@/infrastructure/prisma/client";
import { LocalDiskStorage } from "@/infrastructure/storage/local-disk-storage";
import { env } from "@/lib/env";
import { childCategories, groups, topLevelCategories, type SeedProduct } from "./seed-data";

function categoryGlyph(name: string): string {
  const map: Record<string, string> = {
    قهوه: "☕",
    چای: "🍵",
    "شکلات و شیر": "🍫",
    "نوشیدنی سرد": "🥤",
    آبمیوه: "🧃",
    "شیک و اسموتی": "🥛",
    "دسر و کیک": "🍰",
    "پیش‌غذا": "🍟",
    سالاد: "🥗",
    برگر: "🍔",
    ساندویچ: "🥪",
    پیتزا: "🍕",
    سوخاری: "🍗",
    بشقاب: "🍝",
    "نوشیدنی گرم": "☕",
    "آبمیوه و شیک": "🧃",
    "پیش‌غذا و سالاد": "🥗",
    "غذای اصلی": "🍽️",
  };
  return map[name] ?? "✦";
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function deterministicSvg(productName: string, categoryName: string): string {
  const initial = [...productName][0] ?? "✦";
  const glyph = categoryGlyph(categoryName);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#96601F"/><stop offset="100%" stop-color="#C89B54"/></linearGradient></defs><rect width="800" height="600" rx="24" fill="url(#g)"/><text x="400" y="260" text-anchor="middle" font-family="sans-serif" font-size="120" fill="white" opacity="0.95">${escapeXml(initial)}</text><text x="400" y="360" text-anchor="middle" font-family="sans-serif" font-size="42" fill="white" opacity="0.9">${escapeXml(glyph)}</text><text x="400" y="430" text-anchor="middle" font-family="sans-serif" font-size="20" fill="white" opacity="0.85">${escapeXml(productName)}</text><text x="400" y="460" text-anchor="middle" font-family="sans-serif" font-size="16" fill="white" opacity="0.7">${escapeXml(categoryName)}</text><text x="400" y="540" text-anchor="middle" font-family="sans-serif" font-size="18" fill="white" opacity="0.6">✦ دلِپ ✦</text></svg>`;
}

async function main() {
  await mkdir(path.join(env.STORAGE_ROOT, "uploads"), { recursive: true });

  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, restaurantName: "دلِپ", theme: "WARM_HONEY", unavailableMode: "MUTED" },
    update: {},
  });

  const adminCount = await prisma.adminUser.count();
  // Skip when ADMIN_* are unset — E2E creates the admin via admin-reset after seed.
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
  const shouldTryDownload = env.SEED_DOWNLOAD_IMAGES === "true";

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
          data: {
            description: product.description,
            price,
            discountedPrice: product.discountedPrice ?? null,
            discountActive: product.discountActive ?? false,
            isAvailable,
            sortOrder: sortCounter,
            badges: { set: badges },
          },
        });
        productId = existing.id;
        await prisma.productVariant.deleteMany({ where: { productId } });
      } else {
        const created = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price,
            discountedPrice: product.discountedPrice ?? null,
            discountActive: product.discountActive ?? false,
            isAvailable,
            sortOrder: sortCounter,
            badges,
            categoryId,
          },
        });
        productId = created.id;
      }

      for (const variant of variants) {
        await prisma.productVariant.create({ data: { productId, name: variant.name, price: variant.price, sortOrder: variant.sortOrder } });
      }

      if (existingMediaId) {
        const mediaRow = await prisma.media.findUnique({ where: { id: existingMediaId } });
        const originalPath = mediaRow
          ? path.join(env.STORAGE_ROOT, mediaRow.path)
          : null;
        // Skip re-encoding when the original file is already on disk.
        if (originalPath && existsSync(originalPath)) continue;
        await storage.deleteAll(existingMediaId);
        if (mediaRow) {
          await prisma.media.delete({ where: { id: existingMediaId } });
        }
      }

      let bytes: Uint8Array;
      let mimeType: string;
      if (shouldTryDownload) {
        const downloaded = await tryDownloadImage(product.imageKeyword);
        if (downloaded) {
          bytes = downloaded.bytes;
          mimeType = downloaded.mimeType;
        } else {
          const svg = deterministicSvg(product.name, group.category);
          bytes = new TextEncoder().encode(svg);
          mimeType = "image/svg+xml";
        }
      } else {
        const svg = deterministicSvg(product.name, group.category);
        bytes = new TextEncoder().encode(svg);
        mimeType = "image/svg+xml";
      }

      const stored = await optimizer.process({ bytes, mimeType, width: 800, height: 600 });
      await prisma.media.create({
        data: {
          id: stored.mediaId,
          fileName: stored.fileName,
          mimeType: stored.mimeType,
          width: stored.width,
          height: stored.height,
          dominantColor: stored.dominantColor,
          path: stored.path,
        },
      });
      await prisma.product.update({ where: { id: productId }, data: { mediaId: stored.mediaId } });
    }
  }

  console.log("Seed completed");
}

function productPricing(product: SeedProduct): {
  price: number;
  variants: { name: string; price: number; sortOrder: number }[];
} {
  const small = product.small;
  const large = product.large;
  const hasVariants = small != null && large != null;
  if (hasVariants) {
    return {
      price: Math.min(small, large),
      variants: [
        { name: "سایز کوچک", price: small, sortOrder: 10 },
        { name: "سایز بزرگ", price: large, sortOrder: 20 },
      ],
    };
  }
  const unitPrice = product.price;
  if (unitPrice == null) {
    throw new Error(`Seed product "${product.name}" needs price or small/large`);
  }
  return { price: unitPrice, variants: [] };
}

async function tryDownloadImage(
  keyword: string,
): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const url = `https://picsum.photos/seed/${encodeURIComponent(keyword)}/800/600`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return { bytes: new Uint8Array(arrayBuffer), mimeType: res.headers.get("content-type") ?? "image/jpeg" };
  } catch {
    return null;
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
