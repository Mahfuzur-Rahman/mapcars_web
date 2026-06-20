import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Returns the admin profile + menu tree and refreshes the session cookie.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/auth/me", "GET", ADMIN_COOKIE);
}
