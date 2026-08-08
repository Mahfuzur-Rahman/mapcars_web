import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin — mark an error handled (or put it back on the pile).
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/error-logs/[id]/resolved">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/error-logs/${id}/resolved`, "PATCH", ADMIN_COOKIE);
}
