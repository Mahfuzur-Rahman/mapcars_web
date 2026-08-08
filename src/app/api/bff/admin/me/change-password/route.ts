import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Changes the signed-in admin's own password.
export async function POST(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/auth/me/change-password", "POST", ADMIN_COOKIE);
}
