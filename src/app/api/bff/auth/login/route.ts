import type { NextRequest } from "next/server";
import { proxyRoleLogin, ADMIN_COOKIE, CUSTOMER_COOKIE, DRIVER_COOKIE } from "@/lib/server/bff";

export async function POST(req: NextRequest) {
  return proxyRoleLogin(req, "/api/v1/auth/login", {
    admin: ADMIN_COOKIE,
    // BOTH passenger spellings, and this is load-bearing, not tidiness: the key
    // is whatever userType the API returns, and the API keeps returning "rider"
    // until the rename cutover (migration 031). Mapping only "customer" would
    // leave cookieByRole[userType] undefined and break customer sign-in on the
    // very next deploy. Drop the legacy key only after 031 has shipped.
    rider: CUSTOMER_COOKIE,
    customer: CUSTOMER_COOKIE,
    driver: DRIVER_COOKIE,
  });
}
