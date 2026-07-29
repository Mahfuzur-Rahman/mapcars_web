import type { NextRequest } from "next/server";
import { proxyAuthed, DRIVER_COOKIE } from "@/lib/server/bff";

export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/driver/payouts", "GET", DRIVER_COOKIE);
}
