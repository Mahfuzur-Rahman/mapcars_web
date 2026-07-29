import type { NextRequest } from "next/server";
import { proxyAuthed, proxyAuthedUpload, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — every poster, active or not.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/posters", "GET", ADMIN_COOKIE);
}

// Create a poster (multipart: image file + Title/Subtitle/LinkUrl/SortOrder/IsActive).
export async function POST(req: NextRequest) {
  return proxyAuthedUpload(req, "/api/v1/posters", ADMIN_COOKIE);
}
