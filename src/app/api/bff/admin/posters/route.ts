import type { NextRequest } from "next/server";
import { proxyAuthed, proxyAuthedUpload, ADMIN_COOKIE } from "@/lib/server/bff";

// Raise the Next.js body-size limit to match the .NET API's 25 MB cap.
// Without this the default 4 MB limit silently truncates / rejects large poster images.
export const maxDuration = 60; // seconds — allow time for the R2 upload
export const dynamic = "force-dynamic";
// Next.js App Router route segment config: disable the built-in body parser
// so the raw multipart stream is forwarded intact to proxyAuthedUpload.
export const config = {
  api: { bodyParser: { sizeLimit: "25mb" } },
};

// Admin (SuperAdmin or Admin) — every poster, active or not.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/posters", "GET", ADMIN_COOKIE);
}

// Create a poster (multipart: image file + Title/Subtitle/LinkUrl/SortOrder/IsActive).
export async function POST(req: NextRequest) {
  return proxyAuthedUpload(req, "/api/v1/posters", ADMIN_COOKIE);
}
