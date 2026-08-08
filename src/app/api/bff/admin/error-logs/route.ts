import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — the Error Logger list. Filters ride through as
// query params; the API does the filtering and paging.
export async function GET(req: NextRequest) {
  const query = req.nextUrl.search; // already url-encoded, includes the "?"
  return proxyAuthed(req, `/api/v1/admin/error-logs${query}`, "GET", ADMIN_COOKIE);
}
