import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// GET the global payment toggles (public on the API — both mobile apps read it
// before sign-in — routed through the admin BFF for a consistent same-origin
// admin surface, exactly as the fare chart is).
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/payment-settings", "GET", ADMIN_COOKIE);
}

// Publish new settings — SuperAdmin only (enforced by the API).
export async function PUT(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/payment-settings", "PUT", ADMIN_COOKIE);
}
