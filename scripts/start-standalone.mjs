/**
 * Local/E2E production server for `output: "standalone"`.
 * `next start` cannot serve that output (Next.js 15). Bind address comes from
 * STANDALONE_HOSTNAME (not ambient HOSTNAME, which Linux/CI often set to a
 * non-loopback name). Default is 0.0.0.0.
 *
 * The standalone `server.js` does NOT load `.env` by itself and runs with
 * cwd = .next/standalone, so a relative STORAGE_ROOT would resolve against the
 * wrong directory. We load `.env` here (real env vars always win) and
 * absolutize STORAGE_ROOT against the repo root, so the server reads the same
 * `storage/` folder that `pnpm db:seed` wrote.
 */
import { cpSync, existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();

/** Minimal `.env` loader: existing real environment variables always win. */
function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const key = match[1];
    if (!key || process.env[key] !== undefined) continue;
    let value = match[2] ?? "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotEnv();

// Absolutize a relative STORAGE_ROOT against the repo root so the standalone
// server (cwd = .next/standalone) reads the same folder the seed wrote to.
if (process.env.STORAGE_ROOT && !path.isAbsolute(process.env.STORAGE_ROOT)) {
  process.env.STORAGE_ROOT = path.resolve(root, process.env.STORAGE_ROOT);
}

const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standalone, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standalone, "public");

if (!existsSync(path.join(standalone, "server.js"))) {
  console.error("Missing .next/standalone/server.js — run `pnpm build` first.");
  process.exit(1);
}

cpSync(staticSrc, staticDest, { recursive: true });
if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}

const child = spawn(process.execPath, ["server.js"], {
  cwd: standalone,
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: process.env.PORT ?? "3000",
    HOSTNAME: process.env.STANDALONE_HOSTNAME ?? "0.0.0.0",
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});