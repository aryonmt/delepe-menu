import type { UploadMediaResult } from "@/application/dtos";
import { uploadMediaSchema } from "@/application/schemas";
import { ValidationError } from "@/domain/errors";
import type { ImageOptimizer, MediaRepository } from "@/domain/ports";
import {
  UPLOAD_ASPECT_RATIO,
  UPLOAD_ASPECT_TOLERANCE,
  UPLOAD_MAX_BYTES,
} from "@/lib/constants";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** BR-11: magic bytes, size, 1:1 ±2%, then persist via optimizer + media repo. */
export class UploadMediaUseCase {
  constructor(
    private readonly optimizer: ImageOptimizer,
    private readonly media: MediaRepository,
  ) {}

  async execute(input: unknown): Promise<UploadMediaResult> {
    const data = parseOrThrow(uploadMediaSchema, input);
    if (data.bytes.byteLength > UPLOAD_MAX_BYTES) {
      throw new ValidationError("INVALID_UPLOAD");
    }
    const mimeType = sniffMime(data.bytes);
    if (!mimeType) {
      throw new ValidationError("INVALID_UPLOAD");
    }
    const ratio = data.width / data.height;
    if (Math.abs(ratio - UPLOAD_ASPECT_RATIO) > UPLOAD_ASPECT_RATIO * UPLOAD_ASPECT_TOLERANCE) {
      throw new ValidationError("INVALID_UPLOAD");
    }
    const stored = await this.optimizer.process({
      bytes: data.bytes,
      mimeType,
      width: data.width,
      height: data.height,
    });
    await this.media.create({
      id: stored.mediaId,
      fileName: stored.fileName,
      mimeType: stored.mimeType,
      width: stored.width,
      height: stored.height,
      dominantColor: stored.dominantColor,
      path: stored.path,
    });
    return {
      mediaId: stored.mediaId,
      dominantColor: stored.dominantColor,
      width: stored.width,
      height: stored.height,
    };
  }
}

function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}
