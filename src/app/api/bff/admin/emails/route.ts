import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — the Email list. Filters ride through as query
// params; the API does the filtering and paging.
export async function GET(req: NextRequest) {
  const query = req.nextUrl.search; // already url-encoded, includes the "?"
  return proxyAuthed(req, `/api/v1/admin/emails${query}`, "GET", ADMIN_COOKIE);
}

// Compose — send an ad-hoc email from one of the @mapcars.uk addresses.
export async function POST(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/emails", "POST", ADMIN_COOKIE);
}
