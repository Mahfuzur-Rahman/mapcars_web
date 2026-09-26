import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin — one statement with its per-trip lines.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/statements/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/statements/${encodeURIComponent(id)}`, "GET", ADMIN_COOKIE);
}
