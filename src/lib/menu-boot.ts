import type { ProductDto } from "@/application/dtos";
import { HERO_ORBIT_IMAGE_PATHS } from "./hero-orbit-images";
import { mediaUrl } from "./media-url";

export function isMenuBootComplete(input: {
  elapsedMs: number;
  minMs: number;
  maxMs: number;
  pending: number;
}): boolean {
  if (input.elapsedMs >= input.maxMs) return true;
  if (input.elapsedMs < input.minMs) return false;
  return input.pending <= 0;
}

/** Hero orbit assets + first four product photos (docs/05/06 B-12 priority). */
export function collectMenuBootImageUrls(products: ProductDto[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  const push = (url: string) => {
    if (seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };
  for (const path of HERO_ORBIT_IMAGE_PATHS) push(path);
  let photos = 0;
  for (const product of products) {
    if (!product.media) continue;
    const url = mediaUrl(product.media.id, 640);
    if (seen.has(url)) continue;
    push(url);
    photos += 1;
    if (photos >= 4) break;
  }
  return urls;
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
}
