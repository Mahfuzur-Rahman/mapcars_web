import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin: approve or reject a tier appeal.
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ appealId: string }> },
) {
  const { appealId } = await ctx.params;
  return proxyAuthed(
    req,
    `/api/v1/admin/driver-review/tier-appeals/${appealId}/review`,
    "PUT",
    ADMIN_COOKIE,
  );
}
