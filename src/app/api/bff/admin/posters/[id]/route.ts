import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Update a poster's metadata (title/subtitle/link/sort order/active).
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/posters/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/posters/${id}`, "PUT", ADMIN_COOKIE);
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/posters/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/posters/${id}`, "DELETE", ADMIN_COOKIE);
}
