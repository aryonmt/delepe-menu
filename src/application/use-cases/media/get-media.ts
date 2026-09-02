import type { Media } from "@/domain/entities";
import { NotFoundError } from "@/domain/errors";
import type { MediaRepository } from "@/domain/ports";

/**
 * Loads one Media row by id for the public `/media/[mediaId]` route.
 * Does not stream files — the route handler reads WebP variants from disk.
 */
export class GetMediaUseCase {
  constructor(private readonly media: MediaRepository) {}

  async execute(input: { id: string }): Promise<Media> {
    const row = await this.media.findById(input.id);
    if (!row) {
      throw new NotFoundError();
    }
    return row;
  }
}
