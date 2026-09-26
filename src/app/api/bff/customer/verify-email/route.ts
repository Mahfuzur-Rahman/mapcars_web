import type { NextRequest } from "next/server";
import { proxyLogin, CUSTOMER_COOKIE } from "@/lib/server/bff";

export async function POST(req: NextRequest) {
  return proxyLogin(req, "/api/v1/auth/customers/verify-email", CUSTOMER_COOKIE);
}
