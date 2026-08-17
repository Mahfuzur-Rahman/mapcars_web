import type { NextRequest } from "next/server";
import { proxyAuthedDownload, DRIVER_COOKIE } from "@/lib/server/bff";

// Stream document bytes (image / PDF) for the driver to view.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await ctx.params;
  return proxyAuthedDownload(
    req,
    `/api/v1/documents/${documentId}/content`,
    DRIVER_COOKIE,
  );
}
