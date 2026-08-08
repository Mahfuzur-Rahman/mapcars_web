import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin — one error entry, stack trace included.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/error-logs/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/error-logs/${id}`, "GET", ADMIN_COOKIE);
}
