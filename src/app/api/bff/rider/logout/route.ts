import { proxyLogout, RIDER_COOKIE } from "@/lib/server/bff";

export async function POST() {
  return proxyLogout(RIDER_COOKIE);
}
