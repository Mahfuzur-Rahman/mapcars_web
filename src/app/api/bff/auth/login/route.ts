import type { NextRequest } from "next/server";
import { proxyRoleLogin, ADMIN_COOKIE, RIDER_COOKIE, DRIVER_COOKIE } from "@/lib/server/bff";

export async function POST(req: NextRequest) {
  return proxyRoleLogin(req, "/api/v1/auth/login", {
    admin: ADMIN_COOKIE,
    rider: RIDER_COOKIE,
    driver: DRIVER_COOKIE,
  });
}
