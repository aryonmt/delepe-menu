import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";
import {
  CSP_REPORT_ONLY,
  HEADER_FRAME_DENY,
  HEADER_NOSNIFF,
  HEADER_REFERRER,
} from "@/lib/security-headers";

const SESSION_SECRET = new TextEncoder().encode(env.SESSION_SECRET);

/**
 * Edge session guard. Imports jose only for crypto (no Prisma, no argon2).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await hasValidSession(request);

  if (pathname === "/login" && authed) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/admin/products", request.url)),
      pathname,
    );
  }
  if (isProtected(pathname) && !authed) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
      pathname,
    );
  }
  if (pathname === "/admin" && authed) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/admin/products", request.url)),
      pathname,
    );
  }
  return withSecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: ["/login", "/admin", "/admin/:path*", "/api/admin/:path*"],
};

function isProtected(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }
  try {
    await jwtVerify(token, SESSION_SECRET, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

function withSecurityHeaders(response: NextResponse, pathname: string) {
  response.headers.set("X-Content-Type-Options", HEADER_NOSNIFF);
  response.headers.set("Referrer-Policy", HEADER_REFERRER);
  // CSP ships report-only in v1 (docs/10). Next.js dev tooling relies on
  // eval-based source maps; sending the header in development only produces
  // console noise, so it is gated to production here.
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy-Report-Only",
      CSP_REPORT_ONLY,
    );
  }
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Frame-Options", HEADER_FRAME_DENY);
    response.headers.set("Cache-Control", "no-store");
  }
  return response;
}