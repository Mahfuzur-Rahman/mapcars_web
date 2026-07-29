import type { NextRequest } from "next/server";
import { proxyAuthedUpload, ADMIN_COOKIE } from "@/lib/server/bff";

// Replace a poster's image (multipart: file only).
export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/posters/[id]/image">,
) {
  const { id } = await ctx.params;
  return proxyAuthedUpload(req, `/api/v1/posters/${id}/image`, ADMIN_COOKIE);
}
