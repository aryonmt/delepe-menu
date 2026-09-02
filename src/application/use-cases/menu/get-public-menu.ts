import type { PublicMenuDto } from "@/application/dtos";
import { toPublicMenu } from "@/application/mappers/to-public-menu";
import { GetAdminMenuUseCase } from "./get-admin-menu";

/** Public menu: admin tree run through the pure BR-08 mapper. */
export class GetPublicMenuUseCase {
  constructor(private readonly getAdminMenu: GetAdminMenuUseCase) {}

  async execute(): Promise<PublicMenuDto> {
    const admin = await this.getAdminMenu.execute();
    return toPublicMenu(admin);
  }
}
