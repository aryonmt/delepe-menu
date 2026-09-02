import { unlink } from "node:fs/promises";
import path from "node:path";
import type { MediaStorage } from "@/domain/ports";
import { MEDIA_WIDTHS } from "@/lib/constants";
import { env } from "@/lib/env";

/** Best-effort deletion of original + WebP variants (BR-03). Missing files are ignored. */
export class LocalDiskStorage implements MediaStorage {
  async deleteAll(mediaId: string): Promise<void> {
    const dir = path.join(env.STORAGE_ROOT, "uploads");
    await tryUnlink(path.join(dir, `${mediaId}.jpg`));
    await tryUnlink(path.join(dir, `${mediaId}.png`));
    await tryUnlink(path.join(dir, `${mediaId}.webp`));
    for (const width of MEDIA_WIDTHS) {
      await tryUnlink(path.join(dir, `${mediaId}_${width}.webp`));
    }
  }
}

async function tryUnlink(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // File may not exist yet (M1) or already removed.
  }
}
