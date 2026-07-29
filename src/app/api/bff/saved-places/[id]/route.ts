import type { NextRequest } from "next/server";
import { proxyAuthed, RIDER_COOKIE } from "@/lib/server/bff";

// Update an existing saved place.
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/saved-places/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/saved-places/${id}`, "PUT", RIDER_COOKIE);
}

// Delete a saved place.
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/saved-places/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/saved-places/${id}`, "DELETE", RIDER_COOKIE);
}
