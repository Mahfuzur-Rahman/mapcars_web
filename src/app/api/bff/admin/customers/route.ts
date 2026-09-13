import type { NextRequest } from "next/server";
import { proxyAuthed, ADMIN_COOKIE } from "@/lib/server/bff";

// Admin (SuperAdmin or Admin) — list all customers.
export async function GET(req: NextRequest) {
  return proxyAuthed(req, "/api/v1/customers", "GET", ADMIN_COOKIE);
}
