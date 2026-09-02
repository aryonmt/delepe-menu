import { prisma } from "@/infrastructure/prisma/client";

/**
 * Idempotent M0 stub. Full real-menu seed lands in M3 (docs/04, ADR-10).
 * Safe to re-run: Settings singleton (id = 1) is upserted, never wiped.
 */
async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      restaurantName: "دلِپ",
    },
    update: {},
  });
  console.log("Seed initialized");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
