import type { SettingsDto } from "@/application/dtos";
import { toSettingsDto } from "@/application/mappers/to-dto";
import { NotFoundError } from "@/domain/errors";
import type { SettingsRepository } from "@/domain/ports";

/** Reads the settings singleton. */
export class GetSettingsUseCase {
  constructor(private readonly settings: SettingsRepository) {}

  async execute(): Promise<SettingsDto> {
    const row = await this.settings.get();
    if (!row) {
      throw new NotFoundError();
    }
    return toSettingsDto(row);
  }
}
