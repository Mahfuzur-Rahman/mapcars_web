import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin: list all documents with pending deletion requests.
export async function GET(req: NextRequest) {
  return proxyAuthed(
    req,
    "/api/v1/admin/driver-review/document-deletions",
    "GET",
    ADMIN_COOKIE,
  );
}
