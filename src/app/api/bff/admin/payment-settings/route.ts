import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// GET the FULL settings document, including the fraud thresholds.
//
// Deliberately not the anonymous `/api/v1/payment-settings`, which returns the
// three method fields only: publishing "5 card attempts a day, bookings blocked
// above this much debt" would hand an attacker the shape of every limit they
// need to stay under. The admin portal is the one caller that may see them, and
// the API enforces SuperAdmin on this route.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/payment-settings/admin", "GET", ADMIN_COOKIE);
}

// Publish new settings — SuperAdmin only (enforced by the API).
export async function PUT(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/payment-settings", "PUT", ADMIN_COOKIE);
}
