// Proxy (formerly "Middleware" — renamed in Next.js 16). Runs on the server
// before a request completes. This is an OPTIMISTIC auth guard: it only checks
// for the *presence* of the session cookie to pre-filter unauthenticated users
// and avoid flashing protected UI. The real authorization happens at the API,
// and the BFF clears the cookie on a 401.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "mc_admin";
const CUSTOMER_COOKIE = "mc_customer";
/** Pre-rename name. Kept so a session created before the rename is not bounced
 *  to /auth/login here while the BFF would have happily accepted it. Must be
 *  deleted at the same time as its twin in lib/server/bff.ts, not before. */
const LEGACY_CUSTOMER_COOKIE = "mc_rider";
const DRIVER_COOKIE = "mc_driver";

/** This guard is optimistic - it only checks a cookie is present; the API is
 *  still the authority. Accept either spelling for the customer session. */
function hasCustomerSession(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get(CUSTOMER_COOKIE)?.value ??
      req.cookies.get(LEGACY_CUSTOMER_COOKIE)?.value,
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin portal — everything except the login page requires an admin session.
  // Sign-in is unified at /auth/login (/admin/login is kept only as a
  // redirect stub for old bookmarks/links).
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!req.cookies.get(ADMIN_COOKIE)?.value) {
      return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }
  }

  // Customer profile setup requires a customer session.
  if (pathname.startsWith("/auth/profile")) {
    if (!hasCustomerSession(req)) {
      return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }
  }

  // Customer account area (trip records, document upload) requires a customer session.
  if (pathname.startsWith("/account")) {
    if (!hasCustomerSession(req)) {
      return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }
  }

  // Driver area (documents, payouts) — everything except the login page
  // requires a driver session. This is what keeps a driver session out of
  // customer-only pages and vice versa: the two cookies are never interchangeable.
  // Sign-in is unified at /auth/login (/auth/driver/login is kept only as a
  // redirect stub for old bookmarks/links).
  if (pathname.startsWith("/driver") && pathname !== "/auth/driver/login") {
    if (!req.cookies.get(DRIVER_COOKIE)?.value) {
      return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/profile/:path*", "/account/:path*", "/driver/:path*"],
};
