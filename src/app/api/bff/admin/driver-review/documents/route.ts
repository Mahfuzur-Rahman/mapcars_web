import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// List all driver documents across all drivers, optionally filtered by ?status=
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const path = status
    ? `/api/v1/admin/driver-review/documents?status=${encodeURIComponent(status)}`
    : "/api/v1/admin/driver-review/documents";
  return proxyAuthed(req, path, "GET", ADMIN_COOKIE);
}
