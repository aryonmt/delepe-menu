import { readFile } from "node:fs/promises";
import path from "node:path";
import { getMediaSchema } from "@/application/schemas";
import { NotFoundError } from "@/domain/errors";
import { container } from "@/infrastructure/di/container";
import { env } from "@/lib/env";
import { parseMediaWidth } from "@/lib/media-url";

function notFound() {
  return new Response("Not Found", { status: 404 });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await context.params;
  const parsedId = getMediaSchema.safeParse({ id: mediaId });
  if (!parsedId.success) return notFound();

  const width = parseMediaWidth(new URL(request.url).searchParams.get("w"));
  if (width === null) return notFound(); // 404 on invalid width

  try {
    await container.getMedia().execute(parsedId.data);
  } catch (error) {
    if (error instanceof NotFoundError) return notFound();
    throw error;
  }

  const filePath = path.join(env.STORAGE_ROOT, "uploads", `${mediaId}_${String(width)}.webp`);
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
    return notFound();
  }
}