import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — dashboard headline stats.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/stats", "GET", ADMIN_COOKIE);
}
