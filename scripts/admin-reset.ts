/**
 * Recovery CLI stub. Argon2 hashing and AdminUser upsert land in M2 (docs/10).
 * Loads `.env` so the script is a valid entrypoint from a fresh clone.
 */
process.loadEnvFile?.(".env");

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

const username = flag("--username");
const password = flag("--password");

if (!username || !password) {
  console.error(
    "Usage: pnpm admin:reset --username <name> --password <secret>",
  );
  process.exit(1);
}

console.log(
  `admin-reset stub: would reset "${username}" (argon2 hashing lands in M2).`,
);
