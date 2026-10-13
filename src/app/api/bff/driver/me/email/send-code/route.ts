import type { NextRequest } from "next/server";
import { proxyAuthed, DRIVER_COOKIE } from "@/lib/server/bff";

// Email a 6-digit code to the current driver's saved (unverified) profile email.
// No body. 400 if there's no email or it's already verified; may 429.
export async function POST(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/auth/drivers/me/email/send-code", "POST", DRIVER_COOKIE);
}
