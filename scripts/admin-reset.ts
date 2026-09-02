/**
 * Recovery CLI. Loads `.env` before any module that parses `lib/env`.
 */
try {
  process.loadEnvFile?.(".env");
} catch {
  // .env file is optional or missing
}

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

async function main(): Promise<void> {
  const username = flag("--username");
  const password = flag("--password");

  if (!username || !password) {
    console.error(
      "Usage: pnpm admin:reset --username <name> --password <secret>",
    );
    process.exit(1);
  }

  const { disconnectPrisma, resetAdminUser } = await import(
    "@/infrastructure/prisma/reset-admin"
  );

  try {
    await resetAdminUser(username, password);
    console.log(`Admin user "${username}" reset.`);
  } catch (error: unknown) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await disconnectPrisma();
  }
}

void main();
