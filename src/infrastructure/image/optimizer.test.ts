import { access, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import { MEDIA_WIDTHS } from "@/lib/constants";
import { env } from "@/lib/env";
import { SharpImageOptimizer } from "./optimizer";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe("SharpImageOptimizer", () => {
  const createdIds: string[] = [];

  afterEach(async () => {
    const dir = path.join(env.STORAGE_ROOT, "uploads");
    for (const mediaId of createdIds.splice(0)) {
      const original = path.join(dir, `${mediaId}.jpg`);
      try {
        await unlink(original);
      } catch {
        // ignore
      }
      for (const width of MEDIA_WIDTHS) {
        const variant = path.join(dir, `${mediaId}_${width}.webp`);
        try {
          await unlink(variant);
        } catch {
          // ignore
        }
      }
    }
  });

  it("produces original + 3 WebP variants + dominantColor hex from a raster fixture", async () => {
    await mkdir(path.join(env.STORAGE_ROOT, "uploads"), { recursive: true });
    // Create a tiny 8x8 PNG fixture (1:1) — deterministic, no network
    const fixture = await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 180, g: 100, b: 40 } },
    })
      .png()
      .toBuffer();

    const optimizer = new SharpImageOptimizer();
    const stored = await optimizer.process({
      bytes: new Uint8Array(fixture),
      mimeType: "image/png",
      width: 800,
      height: 800,
    });

    createdIds.push(stored.mediaId);

    expect(stored.fileName).toBe(`${stored.mediaId}.jpg`);
    expect(stored.path).toBe(`uploads/${stored.mediaId}.jpg`);
    expect(stored.mimeType).toBe("image/jpeg");
    expect(stored.width).toBe(800);
    expect(stored.height).toBe(800);
    expect(stored.dominantColor).toMatch(/^#[0-9A-F]{6}$/);

    const dir = path.join(env.STORAGE_ROOT, "uploads");
    expect(await fileExists(path.join(dir, `${stored.mediaId}.jpg`))).toBe(true);
    for (const width of MEDIA_WIDTHS) {
      const variantPath = path.join(dir, `${stored.mediaId}_${width}.webp`);
      expect(await fileExists(variantPath)).toBe(true);
    }
  });

  it("rasterizes SVG inputs to JPEG + WebP variants", async () => {
    await mkdir(path.join(env.STORAGE_ROOT, "uploads"), { recursive: true });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#96601F"/></svg>`;
    const optimizer = new SharpImageOptimizer();
    const stored = await optimizer.process({
      bytes: new TextEncoder().encode(svg),
      mimeType: "image/svg+xml",
      width: 800,
      height: 800,
    });
    createdIds.push(stored.mediaId);
    expect(stored.dominantColor).toMatch(/^#[0-9A-F]{6}$/);
    const dir = path.join(env.STORAGE_ROOT, "uploads");
    expect(await fileExists(path.join(dir, `${stored.mediaId}.jpg`))).toBe(true);
    for (const width of MEDIA_WIDTHS) {
      expect(await fileExists(path.join(dir, `${stored.mediaId}_${width}.webp`))).toBe(true);
    }
  });
});
