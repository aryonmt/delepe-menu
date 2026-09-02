import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from "@/lib/constants";
import { env } from "@/lib/env";

/** Cookie flags for `delepe_session` (docs/10). Path is root so APIs receive it. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: env.NODE_ENV === "production",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

type CookieJar = {
  set: (
    name: string,
    value: string,
    options?: ReturnType<typeof sessionCookieOptions>,
  ) => void;
};

/** Expire the session cookie with the same flags used when it was set. */
export function clearSessionCookie(jar: CookieJar): void {
  jar.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}
