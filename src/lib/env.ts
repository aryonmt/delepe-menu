import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  MASTER_USERNAME: z.string().optional(),
  MASTER_PASSWORD: z.string().optional(),
  SEED_DOWNLOAD_IMAGES: z.string().optional(),
  STORAGE_ROOT: z.string().default("/data/storage"),
  PORT: z.coerce.number().int().positive().default(3000),
});

/**
 * Fail-fast validated environment. The only module allowed to read `process.env`.
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  MASTER_USERNAME: process.env.MASTER_USERNAME,
  MASTER_PASSWORD: process.env.MASTER_PASSWORD,
  SEED_DOWNLOAD_IMAGES: process.env.SEED_DOWNLOAD_IMAGES,
  STORAGE_ROOT: process.env.STORAGE_ROOT,
  PORT: process.env.PORT,
});
