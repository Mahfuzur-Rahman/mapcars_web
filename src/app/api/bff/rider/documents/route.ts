import type { NextRequest } from "next/server";
import { proxyAuthed, proxyAuthedUpload, RIDER_COOKIE } from "@/lib/server/bff";

export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/documents", "GET", RIDER_COOKIE);
}

export async function POST(req: NextRequest) {
  return proxyAuthedUpload(req, "/api/v1/documents", RIDER_COOKIE);
}
