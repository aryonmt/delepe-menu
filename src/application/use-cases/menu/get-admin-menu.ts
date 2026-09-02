import type { AdminMenuDto } from "@/application/dtos";
import { toCategoryDto, toSettingsDto } from "@/application/mappers/to-dto";
import { NotFoundError } from "@/domain/errors";
import type { CategoryRepository, SettingsRepository } from "@/domain/ports";

/** Unfiltered menu tree for the admin draft (BR-08 is applied only by toPublicMenu). */
export class GetAdminMenuUseCase {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly settings: SettingsRepository,
  ) {}

  async execute(): Promise<AdminMenuDto> {
    const settings = await this.settings.get();
    if (!settings) {
      throw new NotFoundError();
    }
    const tree = await this.categories.findTree();
    return {
      settings: toSettingsDto(settings),
      categories: tree.map(toCategoryDto),
    };
  }
}
