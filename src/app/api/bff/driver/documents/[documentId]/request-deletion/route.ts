import type { NextRequest } from "next/server";
import { proxyAuthed, DRIVER_COOKIE } from "@/lib/server/bff";

// Driver: request an uploaded document to be deleted by admin.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await ctx.params;
  return proxyAuthed(
    req,
    `/api/v1/documents/${documentId}/request-deletion`,
    "POST",
    DRIVER_COOKIE,
  );
}
