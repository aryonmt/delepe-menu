import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { StoredImage } from "@/domain/entities";
import type { ImageOptimizer } from "@/domain/ports";
import { MEDIA_WIDTHS } from "@/lib/constants";
import { env } from "@/lib/env";

/**
 * Metadata-only optimizer so the M1 container can construct UploadMediaUseCase.
 * Kept for reference; the production container now wires SharpImageOptimizer.
 */
export class PassthroughImageOptimizer implements ImageOptimizer {
  async process(input: {
    bytes: Uint8Array;
    mimeType: string;
    width: number;
    height: number;
  }): Promise<StoredImage> {
    void input.bytes;
    const mediaId = randomUUID(); // docs/03 naming contract: {randomUUID-v4}.{ext}
    const ext = extensionFor(input.mimeType);
    return {
      mediaId,
      fileName: `${mediaId}.${ext}`,
      mimeType: input.mimeType,
      width: input.width,
      height: input.height,
      dominantColor: "#C4A574",
      path: `uploads/${mediaId}.${ext}`,
    };
  }
}

/**
 * Production optimizer: saves original as JPEG q0.92 (SVG rasterized),
 * generates 320/640/960 WebP variants, extracts dominantColor via sharp.stats().
 */
export class SharpImageOptimizer implements ImageOptimizer {
  async process(input: {
    bytes: Uint8Array;
    mimeType: string;
    width: number;
    height: number;
  }): Promise<StoredImage> {
    const mediaId = randomUUID();
    const uploadsDir = path.join(env.STORAGE_ROOT, "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const sourceBuffer = Buffer.from(input.bytes);
    const isSvg =
      input.mimeType.includes("svg") ||
      isSvgBuffer(sourceBuffer);

    // Compute dominantColor from the source image
    const dominantColor = await extractDominantColor(sourceBuffer, isSvg);

    // Save original as JPEG q92 (raster inputs converted, SVG rasterized)
    const originalPath = path.join(uploadsDir, `${mediaId}.jpg`);
    if (isSvg) {
      // Rasterize SVG to JPEG
      const rasterized = await sharp(sourceBuffer, { density: 300 })
        .jpeg({ quality: 92 })
        .toBuffer();
      await writeFile(originalPath, rasterized);
    } else {
      // Convert any raster input to JPEG q92
      const jpegBuffer = await sharp(sourceBuffer)
        .jpeg({ quality: 92 })
        .toBuffer();
      await writeFile(originalPath, jpegBuffer);
    }

    // Generate WebP variants
    for (const width of MEDIA_WIDTHS) {
      const variantPath = path.join(uploadsDir, `${mediaId}_${width}.webp`);
      const variantBuffer = await sharp(sourceBuffer, {
        density: isSvg ? 300 : undefined,
      })
        .resize({ width, withoutEnlargement: false })
        .webp({ quality: 80 })
        .toBuffer();
      await writeFile(variantPath, variantBuffer);
    }

    return {
      mediaId,
      fileName: `${mediaId}.jpg`,
      mimeType: "image/jpeg",
      width: input.width,
      height: input.height,
      dominantColor,
      path: `uploads/${mediaId}.jpg`,
    };
  }
}

function extensionFor(mimeType: string): string {
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }
  return "jpg";
}

function isSvgBuffer(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 512).toString("utf8").trimStart();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

async function extractDominantColor(
  buffer: Buffer,
  isSvg: boolean,
): Promise<string> {
  try {
    const stats = await sharp(buffer, {
      density: isSvg ? 300 : undefined,
    }).stats();
    const channels = stats.channels;
    if (channels.length >= 3) {
      const r = Math.round(channels[0].mean);
      const g = Math.round(channels[1].mean);
      const b = Math.round(channels[2].mean);
      return toHex(r, g, b);
    }
  } catch {
    // Fallback to default if stats fail
  }
  return "#C4A574";
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const hex = (value: number) =>
    clamp(value).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}
