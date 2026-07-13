import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// SuperAdmin only — read / set one admin's menu access.
// Next 16: dynamic params arrive as a Promise on the route context.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/admins/[id]/menus">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/admins/${id}/menus`, "GET", ADMIN_COOKIE);
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/admins/[id]/menus">,
) {
  const { id } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/admins/${id}/menus`, "PUT", ADMIN_COOKIE);
}
