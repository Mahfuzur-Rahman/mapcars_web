// Proxy (formerly "Middleware" — renamed in Next.js 16). Runs on the server
// before a request completes. This is an OPTIMISTIC auth guard: it only checks
// for the *presence* of the session cookie to pre-filter unauthenticated users
// and avoid flashing protected UI. The real authorization happens at the API,
// and the BFF clears the cookie on a 401.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "mc_admin";
const RIDER_COOKIE = "mc_rider";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin portal — everything except the login page requires an admin session.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!req.cookies.get(ADMIN_COOKIE)?.value) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
  }

  // Rider profile setup requires a rider session.
  if (pathname.startsWith("/auth/profile")) {
    if (!req.cookies.get(RIDER_COOKIE)?.value) {
      return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/profile/:path*"],
};
