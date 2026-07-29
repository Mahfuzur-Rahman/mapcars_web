import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// GET the current fare chart (public on the API, routed through the admin BFF
// for a consistent same-origin admin surface).
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/fare-chart", "GET", ADMIN_COOKIE);
}

// Publish a new fare-chart version — SuperAdmin only (enforced by the API).
export async function PUT(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/fare-chart", "PUT", ADMIN_COOKIE);
}
