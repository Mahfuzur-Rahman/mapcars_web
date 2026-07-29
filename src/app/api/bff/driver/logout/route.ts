import { proxyLogout, DRIVER_COOKIE } from "@/lib/server/bff";

export async function POST() {
  return proxyLogout(DRIVER_COOKIE);
}
