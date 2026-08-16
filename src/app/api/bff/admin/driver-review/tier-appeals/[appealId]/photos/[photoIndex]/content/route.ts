import type { NextRequest } from "next/server";
import { proxyAuthedDownload, ADMIN_COOKIE } from "@/lib/server/bff";

// Stream an appeal's photo bytes for admin preview.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ appealId: string; photoIndex: string }> },
) {
  const { appealId, photoIndex } = await ctx.params;
  return proxyAuthedDownload(
    req,
    `/api/v1/admin/driver-review/tier-appeals/${appealId}/photos/${photoIndex}/content`,
    ADMIN_COOKIE,
  );
}
