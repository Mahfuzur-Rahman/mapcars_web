import type { NextRequest } from "next/server";
import { proxyAuthed, RIDER_COOKIE } from "@/lib/server/bff";

// List the current rider's saved places.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/saved-places", "GET", RIDER_COOKIE);
}

// Create a new saved place (Home / Work / custom address).
export async function POST(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/saved-places", "POST", RIDER_COOKIE);
}
