#!/usr/bin/env node
/**
 * CI bundle guard (docs/09): @dnd-kit and react-easy-crop must not appear in
 * public-route client chunks. Admin routes may include them.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = ["@dnd-kit", "react-easy-crop"];
const manifestPath = join(".next", "app-build-manifest.json");

if (!existsSync(manifestPath)) {
  console.error("Missing .next/app-build-manifest.json — run `pnpm build` first.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const pages = manifest.pages ?? {};
const leaks = [];

for (const [route, files] of Object.entries(pages)) {
  if (typeof route !== "string" || route.startsWith("/admin")) continue;
  if (!Array.isArray(files)) continue;
  for (const relative of files) {
    if (typeof relative !== "string" || !relative.endsWith(".js")) continue;
    const path = join(".next", relative);
    if (!existsSync(path)) continue;
    const source = readFileSync(path, "utf8");
    for (const needle of FORBIDDEN) {
      if (source.includes(needle)) {
        leaks.push(`${route} → ${relative} contains ${needle}`);
      }
    }
  }
}

if (leaks.length > 0) {
  console.error("Public bundle contains admin-only libraries:\n" + leaks.join("\n"));
  process.exit(1);
}

console.log("Public bundle check passed (no @dnd-kit / react-easy-crop).");
