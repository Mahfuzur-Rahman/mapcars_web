import type { NextRequest } from "next/server";
import { proxyPublic } from "@/lib/server/bff";

export async function POST(req: NextRequest) {
  return proxyPublic(req, "/api/v1/auth/customers/send-otp");
}
