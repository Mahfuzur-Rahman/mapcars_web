import { proxyLogout, ADMIN_COOKIE } from "@/lib/server/bff";

export async function POST() {
  return proxyLogout(ADMIN_COOKIE);
}
