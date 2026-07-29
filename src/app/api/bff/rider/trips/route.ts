import type { NextRequest } from "next/server";
import { proxyAuthed, RIDER_COOKIE } from "@/lib/server/bff";

export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/trips", "GET", RIDER_COOKIE);
}
