import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/infrastructure/prisma/client";
import { MEDIA_WIDTHS } from "@/lib/constants";
import { env } from "@/lib/env";

const VALID_WIDTHS = new Set<number>(MEDIA_WIDTHS as readonly number[]);

// Next 15: params is a Promise
export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await context.params;
  const url = new URL(request.url);
  const wParam = url.searchParams.get("w");

  let width: number;
  if (wParam === null) {
    width = 640;
  } else {
    const parsed = Number.parseInt(wParam, 10);
    if (Number.isNaN(parsed) || !VALID_WIDTHS.has(parsed)) {
      return new Response("Not Found", { status: 404 });
    }
    width = parsed;
  }

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) {
    return new Response("Not Found", { status: 404 });
  }

  const filePath = path.join(
    env.STORAGE_ROOT,
    "uploads",
    `${mediaId}_${String(width)}.webp`,
  );

  try {
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
