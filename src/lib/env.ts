import { z } from "zod";
import { SESSION_SECRET_MIN_BYTES } from "@/lib/constants";

const EXAMPLE_SESSION_SECRET = "replace-with-at-least-32-bytes-secret!!";
const EXAMPLE_ADMIN_PASSWORD = "change-me-now";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: z.string().min(SESSION_SECRET_MIN_BYTES),
    ADMIN_USERNAME: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    MASTER_USERNAME: z.string().optional(),
    MASTER_PASSWORD: z.string().optional(),
    STORAGE_ROOT: z.string().default("/data/storage"),
    PORT: z.coerce.number().int().positive().default(3000),
  })
  .superRefine((data, ctx) => {
    if (!isComposeProductionRuntime(data.NODE_ENV, data.DATABASE_URL)) return;
    if (data.SESSION_SECRET === EXAMPLE_SESSION_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["SESSION_SECRET"],
        message: "SESSION_SECRET is the example placeholder; generate a unique secret",
      });
    }
    if (data.ADMIN_PASSWORD === EXAMPLE_ADMIN_PASSWORD) {
      ctx.addIssue({
        code: "custom",
        path: ["ADMIN_PASSWORD"],
        message: "ADMIN_PASSWORD is the example placeholder; set a unique password",
      });
    }
  });

type Env = z.infer<typeof envSchema>;

function isComposeProductionRuntime(nodeEnv: Env["NODE_ENV"], databaseUrl: string): boolean {
  if (nodeEnv !== "production") return false;
  try {
    return new URL(databaseUrl).hostname === "db";
  } catch {
    return false;
  }
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse({
    NODE_ENV: source["NODE_ENV"],
    DATABASE_URL: source["DATABASE_URL"],
    SESSION_SECRET: source["SESSION_SECRET"],
    ADMIN_USERNAME: source["ADMIN_USERNAME"],
    ADMIN_PASSWORD: source["ADMIN_PASSWORD"],
    MASTER_USERNAME: source["MASTER_USERNAME"],
    MASTER_PASSWORD: source["MASTER_PASSWORD"],
    STORAGE_ROOT: source["STORAGE_ROOT"],
    PORT: source["PORT"],
  });
}

let cached: Env | null = null;

function readEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, property) {
    if (typeof property !== "string") return undefined;
    return readEnv()[property as keyof Env];
  },
});
