import type { SettingsDto } from "@/application/dtos";
import { toSettingsDto } from "@/application/mappers/to-dto";
import { updateSettingsSchema } from "@/application/schemas";
import type { SettingsRepository } from "@/domain/ports";
import { parseOrThrow } from "@/application/use-cases/shared/parse";

/** BR-10: always upserts settings id = 1. */
export class UpdateSettingsUseCase {
  constructor(private readonly settings: SettingsRepository) {}

  async execute(input: unknown): Promise<SettingsDto> {
    const data = parseOrThrow(updateSettingsSchema, input);
    const row = await this.settings.upsert(data);
    return toSettingsDto(row);
  }
}
