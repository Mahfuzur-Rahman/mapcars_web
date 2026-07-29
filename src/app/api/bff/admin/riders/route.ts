import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — list all riders.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/riders", "GET", ADMIN_COOKIE);
}
