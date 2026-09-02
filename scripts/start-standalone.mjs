/**
 * Local/E2E production server for `output: "standalone"`.
 * `next start` cannot serve that output (Next.js 15). Bind address comes from
 * STANDALONE_HOSTNAME (not ambient HOSTNAME, which Linux/CI often set to a
 * non-loopback name). Default is 0.0.0.0.
 */
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
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
