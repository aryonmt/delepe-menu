// src/application/use-cases/settings/update-settings.ts
import type { SettingsDto } from "@/application/dtos";
import { toSettingsDto } from "@/application/mappers/to-dto";
import { updateSettingsSchema } from "@/application/schemas";
import type { SettingsRepository } from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/**
 * BR-10: always upserts settings id = 1.
 * `tickerProductIds` is optional: a plain settings save preserves the existing
 * curation; the ticker manager sends an explicit list.
 */
export class UpdateSettingsUseCase {
  constructor(private readonly settings: SettingsRepository) {}
  async execute(input: unknown): Promise<SettingsDto> {
    const data = parseOrThrow(updateSettingsSchema, input);
    const existing = await this.settings.get();
    const row = await this.settings.upsert({
      restaurantName: data.restaurantName,
      theme: data.theme,
      unavailableMode: data.unavailableMode,
      tickerProductIds: data.tickerProductIds ?? existing?.tickerProductIds ?? [],
    });
    return toSettingsDto(row);
  }
}