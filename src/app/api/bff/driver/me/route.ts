import type { NextRequest } from "next/server";
import { proxyAuthed, DRIVER_COOKIE } from "@/lib/server/bff";

// Current driver's full profile (name, status, rating, online state, ...).
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/auth/drivers/me", "GET", DRIVER_COOKIE);
}

// Update the current driver's profile. Requires a driver session cookie.
export async function PATCH(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/auth/drivers/me", "PATCH", DRIVER_COOKIE);
}
