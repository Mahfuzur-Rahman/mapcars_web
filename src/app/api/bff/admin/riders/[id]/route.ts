import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — one rider's detail.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/riders/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/riders/${id}`, "GET", ADMIN_COOKIE);
}
