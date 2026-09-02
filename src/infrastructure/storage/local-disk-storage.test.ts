import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MEDIA_ORIGINAL_EXTENSIONS, MEDIA_WIDTHS } from "@/lib/constants";
import { env } from "@/lib/env";
import { LocalDiskStorage } from "./local-disk-storage";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe("LocalDiskStorage.deleteAll", () => {
  const mediaId = "storage-delete-test";
  const dir = path.join(env.STORAGE_ROOT, "uploads");
  const originalPaths = MEDIA_ORIGINAL_EXTENSIONS.map((ext) =>
    path.join(dir, `${mediaId}.${ext}`),
  );
  const variantPaths = MEDIA_WIDTHS.map((width) =>
    path.join(dir, `${mediaId}_${width}.webp`),
  );

  afterEach(async () => {
    for (const filePath of [...originalPaths, ...variantPaths]) {
      try {
        await unlink(filePath);
      } catch {
        // already gone
      }
    }
  });

  it("removes whichever originals and variants exist and never throws for missing ones", async () => {
    await mkdir(dir, { recursive: true });
    for (const filePath of [...originalPaths, ...variantPaths]) {
      await writeFile(filePath, "x");
    }

    const storage = new LocalDiskStorage();
    await storage.deleteAll(mediaId);
    await expect(storage.deleteAll("missing-media")).resolves.toBeUndefined();

    for (const filePath of [...originalPaths, ...variantPaths]) {
      expect(await fileExists(filePath)).toBe(false);
    }
  });
});
