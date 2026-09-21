import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const dockerfile = readFileSync(resolve(root, "Dockerfile"), "utf8");
const updateScript = readFileSync(resolve(root, "scripts/vps-update.sh"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  devDependencies: { prisma: string; tsx: string };
};

describe("production image contract (1GB VPS)", () => {
  it("does not copy the full build node_modules into the runner", () => {
    expect(dockerfile).not.toMatch(
      /COPY --from=build[^\n]*\/app\/node_modules\s+\.\//,
    );
  });

  it("pins prisma and tsx CLI versions to package.json", () => {
    const prisma = pkg.devDependencies.prisma;
    const tsx = pkg.devDependencies.tsx.replace(/^\^/, "");
    expect(dockerfile).toContain(`prisma@${prisma}`);
    expect(dockerfile).toContain(`tsx@${tsx}`);
  });

  it("keeps migrate/seed bins on the documented ./node_modules/.bin paths", () => {
    expect(dockerfile).toContain("/app/node_modules/.bin/prisma");
    expect(dockerfile).toContain("/app/node_modules/.bin/tsx");
  });
});

describe("VPS update script must not touch restaurant data", () => {
  const commands = updateScript
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n");

  it("never removes volumes or resets migrations", () => {
    expect(commands).not.toMatch(/compose down[^\n]*-v/);
    expect(commands).not.toMatch(/volume rm/);
    expect(commands).not.toMatch(/migrate reset/);
    expect(commands).not.toMatch(/--force-recreate\s+db/);
  });

  it("stops only app and caddy so Postgres keeps serving the volume", () => {
    expect(updateScript).toMatch(/compose\s+up -d db/);
    expect(updateScript).toMatch(/compose\s+stop\s+app\s+caddy/);
    expect(updateScript).toMatch(/compose\s+build\s+app/);
    expect(updateScript).not.toMatch(/compose\s+stop\s+db/);
  });

  it("brings the previous app image back if the build fails", () => {
    expect(updateScript).toMatch(/Build failed; starting the previous app image/);
  });
});
