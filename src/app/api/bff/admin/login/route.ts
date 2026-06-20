import type { NextRequest } from "next/server";
import { proxyLogin, ADMIN_COOKIE } from "@/lib/server/bff";

export async function POST(req: NextRequest) {
  return proxyLogin(req, "/api/v1/admin/auth/login", ADMIN_COOKIE);
}
