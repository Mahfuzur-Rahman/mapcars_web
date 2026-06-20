import type { NextRequest } from "next/server";
import { proxyLogin, RIDER_COOKIE } from "@/lib/server/bff";

export async function POST(req: NextRequest) {
  return proxyLogin(req, "/api/v1/auth/riders/verify-email", RIDER_COOKIE);
}
