import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin: approve (delete) or reject a document deletion request.
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await ctx.params;
  return proxyAuthed(
    req,
    `/api/v1/admin/driver-review/documents/${documentId}/deletion-review`,
    "PUT",
    ADMIN_COOKIE,
  );
}
