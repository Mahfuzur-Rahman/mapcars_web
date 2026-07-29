import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — list drivers for review, optional ?status filter.
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return proxyAuthed(req, `/api/v1/admin/driver-review/drivers${query}`, "GET", ADMIN_COOKIE);
}
