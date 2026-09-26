import type { NextRequest } from "next/server";
import { proxyAuthed, CUSTOMER_COOKIE } from "@/lib/server/bff";

// Current customer's profile (Wave 1 profile/compliance fields).
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/auth/customers/me", "GET", CUSTOMER_COOKIE);
}

// Update the current customer's profile. Requires a customer session cookie.
export async function PATCH(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/auth/customers/me", "PATCH", CUSTOMER_COOKIE);
}
