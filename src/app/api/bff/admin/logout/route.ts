import type { NextRequest } from "next/server";
import { proxyLogout, ADMIN_COOKIE } from "@/lib/server/bff";

// Takes the request now: logging out revokes the refresh token at the API, and
// that token lives in an httpOnly cookie only the server can read.
export async function POST(req: NextRequest) {
  return proxyLogout(req, ADMIN_COOKIE);
}
