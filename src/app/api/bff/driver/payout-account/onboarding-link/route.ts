import type { NextRequest } from "next/server";
import { proxyAuthed, DRIVER_COOKIE } from "@/lib/server/bff";

export async function POST(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/driver/payout-account/onboarding-link", "POST", DRIVER_COOKIE);
}
