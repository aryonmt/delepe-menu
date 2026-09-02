import type { PublicMenuDto } from "@/application/dtos";
import { toPublicMenu } from "@/application/mappers/to-public-menu";
import type { CategoryRepository, SettingsRepository } from "@/domain/ports";
import { GetAdminMenuUseCase } from "./get-admin-menu";

/** Public menu: admin tree run through the pure BR-08 mapper. */
export class GetPublicMenuUseCase {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly settings: SettingsRepository,
  ) {}

  async execute(): Promise<PublicMenuDto> {
    const admin = await new GetAdminMenuUseCase(
      this.categories,
      this.settings,
    ).execute();
    return toPublicMenu(admin);
  }
}
