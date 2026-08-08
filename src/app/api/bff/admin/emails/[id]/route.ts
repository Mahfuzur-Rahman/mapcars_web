import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin — one email entry, body included.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/emails/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/emails/${id}`, "GET", ADMIN_COOKIE);
}
