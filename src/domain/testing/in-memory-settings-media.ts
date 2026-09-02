import type { Media, Settings, StoredImage } from "../entities";
import type {
  ImageOptimizer,
  MediaRepository,
  MediaStorage,
  SettingsRepository,
} from "../ports";
import type { InMemoryDatabase } from "./in-memory-database";

export class InMemorySettingsRepository implements SettingsRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async get(): Promise<Settings | null> {
    return this.db.settings ? { ...this.db.settings } : null;
  }

  async upsert(input: Omit<Settings, "id">): Promise<Settings> {
    const row: Settings = { id: 1, ...input };
    this.db.settings = row;
    return { ...row };
  }
}

export class InMemoryMediaRepository implements MediaRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async findById(id: string): Promise<Media | null> {
    const row = this.db.media.get(id);
    return row ? this.db.cloneMedia(row) : null;
  }

  async create(input: Media): Promise<Media> {
    this.db.media.set(input.id, { ...input });
    return this.db.cloneMedia(input);
  }

  async delete(id: string): Promise<void> {
    this.db.media.delete(id);
  }
}

export class InMemoryMediaStorage implements MediaStorage {
  constructor(private readonly db: InMemoryDatabase) {}

  async deleteAll(mediaId: string): Promise<void> {
    this.db.deletedMediaFiles.push(mediaId);
  }
}

export class InMemoryImageOptimizer implements ImageOptimizer {
  constructor(private readonly db: InMemoryDatabase) {}

  async process(input: {
    bytes: Uint8Array;
    mimeType: string;
    width: number;
    height: number;
  }): Promise<StoredImage> {
    const mediaId = this.db.nextId("media");
    const ext = input.mimeType === "image/png" ? "png" : "jpg";
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
