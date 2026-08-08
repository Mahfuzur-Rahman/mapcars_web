import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin — counts for the Error Logger header strip.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/error-logs/summary", "GET", ADMIN_COOKIE);
}
