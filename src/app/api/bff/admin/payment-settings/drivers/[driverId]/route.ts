import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// One driver's payment overrides, with the effective result resolved against the
// global toggles. Admin or SuperAdmin (enforced by the API).
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/payment-settings/drivers/[driverId]">,
) {
  const { driverId } = await ctx.params;
  return proxyAuthed(req, `/api/v1/payment-settings/drivers/${driverId}`, "GET", ADMIN_COOKIE);
}

// Set (or clear, by sending null) this driver's overrides.
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/payment-settings/drivers/[driverId]">,
) {
  const { driverId } = await ctx.params;
  return proxyAuthed(req, `/api/v1/payment-settings/drivers/${driverId}`, "PUT", ADMIN_COOKIE);
}
