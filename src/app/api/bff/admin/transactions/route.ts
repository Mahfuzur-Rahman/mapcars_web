import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — completed-trip money movements with totals.
// Only the known filters are forwarded: ?method / ?paymentStatus / ?from / ?to
// (ISO UTC; `to` is exclusive) / ?skip / ?take.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ["method", "paymentStatus", "from", "to", "skip", "take"]) {
    const v = sp.get(key);
    if (v) qs.set(key, v);
  }
  const query = qs.toString();
  return proxyAuthed(
    req,
    `/api/v1/admin/transactions${query ? `?${query}` : ""}`,
    "GET",
    ADMIN_COOKIE,
  );
}
