import type { NextRequest } from "next/server";
import { proxyAuthedDownload, ADMIN_COOKIE } from "@/lib/server/bff";

// Stream a document's bytes (image / PDF) for the admin to view. Never a public
// URL — the file flows from the private bucket through the API with the admin's
// bearer token, and back to the browser as an authenticated same-origin stream.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/driver-review/documents/[documentId]/content">,
) {
  const { documentId } = await ctx.params;
  return proxyAuthedDownload(
    req,
    `/api/v1/admin/driver-review/documents/${documentId}/content`,
    ADMIN_COOKIE,
  );
}
