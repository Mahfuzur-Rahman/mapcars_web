import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Full detail for one driver: profile, vehicle, documents.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/driver-review/drivers/[driverId]">,
) {
  const { driverId } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/driver-review/drivers/${driverId}`, "GET", ADMIN_COOKIE);
}
