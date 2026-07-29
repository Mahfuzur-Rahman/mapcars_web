import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Set a driver's overall status (Approved / Rejected / Suspended / PendingApproval).
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/driver-review/drivers/[driverId]/status">,
) {
  const { driverId } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/driver-review/drivers/${driverId}/status`, "PUT", ADMIN_COOKIE);
}
