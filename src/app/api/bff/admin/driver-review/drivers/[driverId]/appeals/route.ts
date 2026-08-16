import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin: list tier appeals for one driver.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ driverId: string }> },
) {
  const { driverId } = await ctx.params;
  return proxyAuthed(
    req,
    `/api/v1/admin/driver-review/drivers/${driverId}/appeals`,
    "GET",
    ADMIN_COOKIE,
  );
}
