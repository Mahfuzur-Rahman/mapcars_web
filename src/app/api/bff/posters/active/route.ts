import { proxyPublicGet } from "@/lib/server/bff";

// Public endpoint — active posters list for landing page.
export async function GET() {
  return proxyPublicGet("/api/v1/posters/active");
}
