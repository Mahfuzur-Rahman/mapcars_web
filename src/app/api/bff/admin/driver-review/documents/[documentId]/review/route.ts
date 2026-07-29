import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Approve or reject a single uploaded document.
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/bff/admin/driver-review/documents/[documentId]/review">,
) {
  const { documentId } = await ctx.params;
  return proxyAuthed(req, `/api/v1/admin/driver-review/documents/${documentId}/review`, "PUT", ADMIN_COOKIE);
}
