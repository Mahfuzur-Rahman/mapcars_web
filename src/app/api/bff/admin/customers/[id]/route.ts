import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — one customer's detail.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/customers/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/customers/${id}`, "GET", ADMIN_COOKIE);
}
