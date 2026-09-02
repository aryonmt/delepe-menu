import { randomUUID } from "node:crypto";
import type { StoredImage } from "@/domain/entities";
import type { ImageOptimizer } from "@/domain/ports";

/**
 * Metadata-only optimizer so the M1 container can construct UploadMediaUseCase.
 * Sharp encode + dominant color land in M5 (T-053).
 */
export class PassthroughImageOptimizer implements ImageOptimizer {
  async process(input: {
    bytes: Uint8Array;
    mimeType: string;
    width: number;
    height: number;
  }): Promise<StoredImage> {
    void input.bytes;
    const mediaId = randomUUID();
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

function extensionFor(mimeType: string): string {
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }
  return "jpg";
}
