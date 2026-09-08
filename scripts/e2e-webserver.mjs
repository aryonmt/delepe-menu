/**
 * Playwright webServer entry (cross-platform).
 * Avoids `cmd /c "..."` quoting: Playwright already runs the command with
 * `shell: true`, which on Windows nests cmd and exits immediately.
 *
 * Sequence: wipe `.next` → migrate + seed the test DB → production build →
 * standalone start. ISR HTML must match the seeded database (docs/09).
 */
import { existsSync, rmSync } from "node:fs";
import { execSync, spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const nextDir = path.join(root, ".next");

if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
}

const execOpts = {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  shell: true,
};

execSync("pnpm db:deploy", execOpts);
execSync("pnpm db:seed", execOpts);
execSync("pnpm build", execOpts);

const server = spawn("pnpm", ["start"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  shell: true,
});

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

server.on("exit", (code) => {
  process.exit(code ?? 1);
});
