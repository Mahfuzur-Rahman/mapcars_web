import type { NextRequest } from "next/server";
import { proxyAuthed, CUSTOMER_COOKIE } from "@/lib/server/bff";

// Confirm the code from send-code. Body: { code }. Returns the updated profile.
// A wrong/expired code is a 400 (not a 401), so the session is left alone.
export async function POST(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/auth/customers/me/email/verify", "POST", CUSTOMER_COOKIE);
}
