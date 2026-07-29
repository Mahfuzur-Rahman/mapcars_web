import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — trip history, optional ?status / ?skip / ?take.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ["status", "skip", "take"]) {
    const v = sp.get(key);
    if (v) qs.set(key, v);
  }
  const query = qs.toString();
  return proxyAuthed(req, `/api/v1/admin/trips${query ? `?${query}` : ""}`, "GET", ADMIN_COOKIE);
}
