import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — live map: active trips + online drivers.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/live", "GET", ADMIN_COOKIE);
}
