import type { z } from "zod";
import { ValidationError } from "@/domain/errors";

/** Zod at the use-case boundary; failures become typed domain errors. */
export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("VALIDATION", result.error.message);
  }
  return result.data;
}
