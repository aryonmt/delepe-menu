import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { PUBLIC_MENU_CACHE_TAG } from "./constants";
import { container } from "@/infrastructure/di/container";

/**
 * Cached public menu fetcher.
 * React cache() deduplicates within a single render;
 * unstable_cache persists across requests and is tagged for revalidation.
 */
const fetchPublicMenu = unstable_cache(
  async () => container.getPublicMenu().execute(),
  ["public-menu"],
  { tags: [PUBLIC_MENU_CACHE_TAG] },
);

export const getPublicMenuCached = cache(async () => fetchPublicMenu());

export function revalidatePublicMenu(): void {
  revalidateTag(PUBLIC_MENU_CACHE_TAG);
}
