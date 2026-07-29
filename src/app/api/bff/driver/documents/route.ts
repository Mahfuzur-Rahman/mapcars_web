import type { NextRequest } from "next/server";
import { proxyAuthed, proxyAuthedUpload, DRIVER_COOKIE } from "@/lib/server/bff";

export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/documents", "GET", DRIVER_COOKIE);
}

export async function POST(req: NextRequest) {
  return proxyAuthedUpload(req, "/api/v1/documents", DRIVER_COOKIE);
}
