import { deleteProductSchema } from "@/application/schemas";
import { NotFoundError } from "@/domain/errors";
import type {
  MediaRepository,
  MediaStorage,
  ProductRepository,
  SettingsRepository,
} from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** BR-03: hard-delete the product, then its Media row and all 4 files. */
export class DeleteProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly media: MediaRepository,
    private readonly storage: MediaStorage,
    private readonly settings: SettingsRepository,
  ) {}

  async execute(input: unknown): Promise<void> {
    const { id } = parseOrThrow(deleteProductSchema, input);
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new NotFoundError();
    }
    const mediaId = existing.mediaId;
    await this.products.delete(id);
    await this.stripFromTicker(id);
    if (mediaId) {
      await this.media.delete(mediaId);
      await this.storage.deleteAll(mediaId);
    }
  }

  private async stripFromTicker(productId: string): Promise<void> {
    const settings = await this.settings.get();
    if (!settings?.tickerProductIds.includes(productId)) return;
    await this.settings.upsert({
      restaurantName: settings.restaurantName,
      theme: settings.theme,
      unavailableMode: settings.unavailableMode,
      tickerProductIds: settings.tickerProductIds.filter((id) => id !== productId),
    });
  }
}
