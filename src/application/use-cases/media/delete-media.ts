import { deleteMediaSchema } from "@/application/schemas";
import { NotFoundError } from "@/domain/errors";
import type { MediaRepository, MediaStorage } from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** Deletes a Media row and the original + three WebP files. */
export class DeleteMediaUseCase {
  constructor(
    private readonly media: MediaRepository,
    private readonly storage: MediaStorage,
  ) {}

  async execute(input: unknown): Promise<void> {
    const { mediaId } = parseOrThrow(deleteMediaSchema, input);
    const existing = await this.media.findById(mediaId);
    if (!existing) {
      throw new NotFoundError();
    }
    await this.media.delete(mediaId);
    await this.storage.deleteAll(mediaId);
  }
}
