import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// SuperAdmin only — create a new admin. Requires an admin session cookie.
export async function POST(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/auth/register", "POST", ADMIN_COOKIE);
}
