import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// SuperAdmin only — full menu catalog (tree).
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/menus", "GET", ADMIN_COOKIE);
}
