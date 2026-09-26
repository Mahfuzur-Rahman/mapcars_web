import type { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/server/bff";

// Anonymous — the landing-page contact form. 202 on success, 400 on
// validation, 429 when rate-limited (5 per 15 minutes per visitor).
export async function POST(req: NextRequest) {
  return proxyPublic(req, "/api/v1/contact");
}
