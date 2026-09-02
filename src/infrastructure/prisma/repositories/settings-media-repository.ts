import type { PrismaClient } from "@prisma/client";
import type { Media, Settings } from "@/domain/entities";
import type { MediaRepository, SettingsRepository } from "@/domain/ports";
import { toMedia, toSettings } from "../mappers";

export class PrismaSettingsRepository implements SettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(): Promise<Settings | null> {
    const row = await this.prisma.settings.findUnique({ where: { id: 1 } });
    return row ? toSettings(row) : null;
  }

  async upsert(input: Omit<Settings, "id">): Promise<Settings> {
    const row = await this.prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1, ...input },
      update: input,
    });
    return toSettings(row);
  }
}

export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Media | null> {
    const row = await this.prisma.media.findUnique({ where: { id } });
    return row ? toMedia(row) : null;
  }

  async create(input: Media): Promise<Media> {
    const row = await this.prisma.media.create({ data: input });
    return toMedia(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.media.delete({ where: { id } });
  }
}
