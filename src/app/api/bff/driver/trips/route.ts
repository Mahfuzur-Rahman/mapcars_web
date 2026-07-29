import type { NextRequest } from "next/server";
import { proxyAuthed, DRIVER_COOKIE } from "@/lib/server/bff";

// The current driver's own trip history (earnings, status, ...).
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/trips/mine", "GET", DRIVER_COOKIE);
}
