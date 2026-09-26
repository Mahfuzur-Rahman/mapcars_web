import type { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/server/bff";

// Anonymous. Sets a new password with the emailed code (204) and signs the
// account out everywhere. No session is created here — the user signs in again.
export async function POST(req: NextRequest) {
  return proxyPublic(req, "/api/v1/auth/password/reset");
}
