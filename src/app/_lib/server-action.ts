import { headers } from "next/headers";
import type { ActionResult } from "@/application/dtos";
import { DomainError, UnauthorizedError } from "@/domain/errors";
import { domainMessage } from "@/lib/fa/domain-message";
import { strings } from "@/lib/fa/strings";

/** Next.js sets `digest` on redirect/notFound errors. */
export function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function toActionFailure(error: unknown): ActionResult<never> {
  const code = errorCode(error);
  if (code) {
    return {
      ok: false,
      error: { code, fa: domainMessage(code) },
    };
  }
  console.error("[action]", error);
  return {
    ok: false,
    error: { code: "UNKNOWN", fa: strings.errors.genericBody },
  };
}

function errorCode(error: unknown): string | undefined {
  if (error instanceof DomainError) {
    return error.code;
  }
  // Next may evaluate `domain/errors` twice; `instanceof` then fails across chunks.
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}

/** Docs/10 CSRF: server actions must come from the same origin. */
export async function assertSameOrigin(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!origin || !host) {
    throw new UnauthorizedError();
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new UnauthorizedError();
  }
  if (originHost !== host) {
    throw new UnauthorizedError();
  }
}

export async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return headerList.get("x-real-ip") ?? "unknown";
}
