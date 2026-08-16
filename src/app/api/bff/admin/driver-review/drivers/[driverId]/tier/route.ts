import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin: directly change/override a driver's vehicle tier.
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ driverId: string }> },
) {
  const { driverId } = await ctx.params;
  return proxyAuthed(
    req,
    `/api/v1/admin/driver-review/drivers/${driverId}/tier`,
    "PUT",
    ADMIN_COOKIE,
  );
}
