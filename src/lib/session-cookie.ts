import { headers } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from "@/lib/constants";

/** Cookie flags for `delepe_session` (docs/10). Path is root so APIs receive it. */
export function isHttpsForwardedProto(forwardedProto: string | null): boolean {
  const first = forwardedProto?.split(",")[0]?.trim().toLowerCase();
  return first === "https";
}

export type SessionCookieFlags = {
  httpOnly: true;
  sameSite: "lax";
  path: "/";
  secure: boolean;
  maxAge: number;
};

export async function sessionCookieOptions(): Promise<SessionCookieFlags> {
  const forwardedProto = (await headers()).get("x-forwarded-proto");
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isHttpsForwardedProto(forwardedProto),
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

type CookieJar = {
  set: (name: string, value: string, options?: SessionCookieFlags) => void;
};

/** Expire the session cookie with the same flags used when it was set. */
export async function clearSessionCookie(jar: CookieJar): Promise<void> {
  jar.set(SESSION_COOKIE_NAME, "", {
    ...(await sessionCookieOptions()),
    maxAge: 0,
  });
}
