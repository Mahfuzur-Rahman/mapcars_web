import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// SuperAdmin only — list all admins with their effective menu counts.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/admin/admins", "GET", ADMIN_COOKIE);
}
