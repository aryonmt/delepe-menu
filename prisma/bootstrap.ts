import { mkdir } from "node:fs/promises";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import { prisma } from "@/infrastructure/prisma/client";
import { env } from "@/lib/env";

/** Settings row + first admin only. Never inserts catalog rows. */
export async function bootstrapSettingsAndAdmin(): Promise<void> {
  await mkdir(path.join(env.STORAGE_ROOT, "uploads"), { recursive: true });
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, restaurantName: "دِ‌لِ‌پِ", theme: "WARM_HONEY", unavailableMode: "MUTED" },
    update: {},
  });

  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0 && env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const passwordHash = await hash(env.ADMIN_PASSWORD);
    await prisma.adminUser.create({ data: { username: env.ADMIN_USERNAME, passwordHash } });
  }
}
