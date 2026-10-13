// Proxy (formerly "Middleware" — renamed in Next.js 16). Runs on the server
// before a request completes. This is an OPTIMISTIC auth guard: it only checks
// for the *presence* of a session cookie to pre-filter unauthenticated users
// and avoid flashing protected UI. The real authorization happens at the API,
// and the BFF clears the cookies on a 401.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "mc_admin";
const CUSTOMER_COOKIE = "mc_customer";
/** Pre-rename name. Kept so a session created before the rename is not bounced
 *  to /auth/login here while the BFF would have happily accepted it. Must be
 *  deleted at the same time as its twin in lib/server/bff.ts, not before. */
const LEGACY_CUSTOMER_COOKIE = "mc_rider";
const DRIVER_COOKIE = "mc_driver";

/**
 * Whether either half of a session is present: the hour-long access cookie or
 * its 90-day refresh cookie (`<name>_rt`). Checking the access cookie alone
 * bounced everyone to sign-in an hour after they last used the site, even
 * though the refresh cookie was still good. The BFF renews from it on the
 * page's first call.
 */
function hasSession(req: NextRequest, ...cookieNames: string[]): boolean {
  return cookieNames.some(
    (name) => Boolean(req.cookies.get(name)?.value) || Boolean(req.cookies.get(`${name}_rt`)?.value),
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const toLogin = () => NextResponse.redirect(new URL("/auth/login", req.nextUrl));

  // Admin portal — everything except the login page requires an admin session.
  // Sign-in is unified at /auth/login (/admin/login is kept only as a
  // redirect stub for old bookmarks/links).
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasSession(req, ADMIN_COOKIE)) return toLogin();
  }

  // Customer profile setup and the account area (trip records, document
  // upload) require a customer session, under either cookie spelling.
  if (pathname.startsWith("/auth/profile") || pathname.startsWith("/account")) {
    if (!hasSession(req, CUSTOMER_COOKIE, LEGACY_CUSTOMER_COOKIE)) return toLogin();
  }

  // Driver area (documents, payouts) — everything except the login page
  // requires a driver session. This is what keeps a driver session out of
  // customer-only pages and vice versa: the two cookies are never interchangeable.
  // Sign-in is unified at /auth/login (/auth/driver/login is kept only as a
  // redirect stub for old bookmarks/links).
  if (pathname.startsWith("/driver") && pathname !== "/auth/driver/login") {
    if (!hasSession(req, DRIVER_COOKIE)) return toLogin();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/profile/:path*", "/account/:path*", "/driver/:path*"],
};
