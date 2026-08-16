import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin: list tier appeals across all drivers with optional ?status filter.
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return proxyAuthed(
    req,
    `/api/v1/admin/driver-review/tier-appeals${query}`,
    "GET",
    ADMIN_COOKIE,
  );
}
