import type { NextRequest } from "next/server";
import { proxyAuthed, RIDER_COOKIE } from "@/lib/server/bff";

// Update the current rider's profile. Requires a rider session cookie.
export async function PATCH(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/auth/riders/me", "PATCH", RIDER_COOKIE);
}
