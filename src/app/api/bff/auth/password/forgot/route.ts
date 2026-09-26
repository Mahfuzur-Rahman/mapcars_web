import type { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/server/bff";

// Anonymous. Emails a 6-digit reset code; always 202, so it never reveals
// whether an account exists. Rate-limited per visitor by the API (429).
export async function POST(req: NextRequest) {
  return proxyPublic(req, "/api/v1/auth/password/forgot");
}
