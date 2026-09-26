import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — weekly driver statements, newest week first.
// Only the known params are forwarded: ?periodStart (UTC instant of a UK week
// start) / ?skip / ?take.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ["periodStart", "skip", "take"]) {
    const v = sp.get(key);
    if (v) qs.set(key, v);
  }
  const query = qs.toString();
  return proxyAuthed(req, `/api/v1/admin/statements${query ? `?${query}` : ""}`, "GET", ADMIN_COOKIE);
}
