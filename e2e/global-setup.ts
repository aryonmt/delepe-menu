import { spawnSync } from "node:child_process";
import path from "node:path";
import { e2eDatabaseUrl, e2eStorageRoot } from "./env";

try {
  process.loadEnvFile?.(".env");
} catch {
  // optional — CI injects env
}

export default function globalSetup() {
  const databaseUrl = e2eDatabaseUrl();
  const testEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    STORAGE_ROOT: e2eStorageRoot(),
  };
  const root = process.cwd();
  const node = process.execPath;

  runOrThrow(node, [prismaCli(root), "migrate", "deploy"], testEnv);
  runOrThrow(node, [tsxCli(root), "prisma/seed.ts"], testEnv);
  runOrThrow(node, [tsxCli(root), "prisma/e2e-seed.ts"], testEnv);
  runOrThrow(
    node,
    [
      tsxCli(root),
      "scripts/admin-reset.ts",
      "--username",
      process.env.ADMIN_USERNAME ?? "admin",
      "--password",
      process.env.ADMIN_PASSWORD ?? "change-me-now",
    ],
    testEnv,
  );
}

function prismaCli(root: string): string {
  return path.join(root, "node_modules", "prisma", "build", "index.js");
}

function tsxCli(root: string): string {
  return path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
}

function runOrThrow(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): void {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `${path.basename(command)} ${args.join(" ")} failed with status ${String(result.status)}`,
    );
  }
}
