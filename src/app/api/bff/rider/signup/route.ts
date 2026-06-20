import type { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/server/bff";

// Signup only triggers an email OTP — no session is created until verification.
export async function POST(req: NextRequest) {
  return proxyPublic(req, "/api/v1/auth/riders/signup");
}
