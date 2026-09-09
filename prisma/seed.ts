import { prisma } from "@/infrastructure/prisma/client";
import { bootstrapSettingsAndAdmin } from "./bootstrap";

async function main() {
  await bootstrapSettingsAndAdmin();
  console.log("Seed completed: settings and admin bootstrap (empty catalog)");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
