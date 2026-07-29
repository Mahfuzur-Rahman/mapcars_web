import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:5200";

// Public endpoint — stream poster image for landing page and admin preview.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/v1/posters/${id}/image`, {
      cache: "no-store",
    });
    if (!res.ok) return new NextResponse("Not found", { status: 404 });
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") ?? "image/jpeg");
    headers.set("Cache-Control", "public, max-age=3600");
    return new NextResponse(res.body, { status: 200, headers });
  } catch {
    return new NextResponse("Server error", { status: 502 });
  }
}
