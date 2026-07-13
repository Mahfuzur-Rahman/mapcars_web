import type { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/server/bff";

// Resends the email verification code (invalidates the previous one).
export async function POST(req: NextRequest) {
  return proxyPublic(req, "/api/v1/auth/riders/resend-email");
}
