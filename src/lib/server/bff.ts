// Backend-for-Frontend (BFF) helpers — SERVER ONLY.
//
// These run inside Route Handlers under /app/api/bff/*. They are the only code
// that talks to the .NET API with a bearer token. The JWT is stored in an
// httpOnly cookie (never exposed to client-side JS), so an XSS bug cannot
// exfiltrate it. The browser only ever talks to same-origin /api/bff/* routes.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Server-side base URL of the .NET API. Prefer a server-only var so the internal
// URL isn't shipped to the browser; fall back to the public one for convenience.
const API_BASE =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? undefined : "http://localhost:5126");

export const ADMIN_COOKIE = "mc_admin";
export const RIDER_COOKIE = "mc_rider";

const TIMEOUT_MS = 15_000;

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

async function callApi(
  path: string,
  method: string,
  body?: unknown,
  token?: string,
): Promise<Response> {
  if (!API_BASE) throw new Error("API base URL is not configured");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

/** Upstream-unreachable / timeout — never leak internal error detail to the client. */
function upstreamError(reason: unknown): NextResponse {
  const isTimeout = reason instanceof DOMException && reason.name === "TimeoutError";
  return NextResponse.json(
    {
      message: isTimeout
        ? "The server took too long to respond. Please try again."
        : "Unable to reach the server. Please try again.",
    },
    { status: 502 },
  );
}

/** If the upstream body carries a JWT, move it into an httpOnly cookie and strip it from the response. */
function jsonWithToken(data: Record<string, unknown> | unknown[], cookieName: string): NextResponse {
  // A JSON array body (e.g. list endpoints) never carries a token — pass it
  // through as-is. Spreading it below would corrupt it into an object.
  if (Array.isArray(data)) return NextResponse.json(data, { status: 200 });

  const { token, expiresInMinutes, ...rest } = data as {
    token?: string;
    expiresInMinutes?: number;
  } & Record<string, unknown>;
  const res = NextResponse.json(rest, { status: 200 });
  if (typeof token === "string" && token) {
    res.cookies.set(cookieName, token, cookieOptions((expiresInMinutes ?? 60) * 60));
  }
  return res;
}

/** Forward a POST body and return the upstream response verbatim (no cookie set). */
export async function proxyPublic(req: NextRequest, apiPath: string): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const apiRes = await callApi(apiPath, "POST", body);
    return NextResponse.json(await readJson(apiRes), { status: apiRes.status });
  } catch (reason) {
    return upstreamError(reason);
  }
}

/** Forward a login-style POST; on success store the JWT in `cookieName` and strip it from the body. */
export async function proxyLogin(
  req: NextRequest,
  apiPath: string,
  cookieName: string,
): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const apiRes = await callApi(apiPath, "POST", body);
    const data = await readJson(apiRes);
    if (!apiRes.ok || !data) {
      return NextResponse.json(data ?? { message: "Request failed" }, { status: apiRes.status });
    }
    return jsonWithToken(data, cookieName);
  } catch (reason) {
    return upstreamError(reason);
  }
}

/** Attach the cookie's JWT as a bearer; refresh the cookie if a new token comes back; clear it on 401. */
export async function proxyAuthed(
  req: NextRequest,
  apiPath: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  cookieName: string,
): Promise<NextResponse> {
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const hasBody = method !== "GET" && method !== "DELETE";
    const body = hasBody ? await req.json().catch(() => ({})) : undefined;
    const apiRes = await callApi(apiPath, method, body, token);
    const data = await readJson(apiRes);

    if (apiRes.status === 401) {
      const res = NextResponse.json(data ?? { message: "Unauthorized" }, { status: 401 });
      res.cookies.set(cookieName, "", cookieOptions(0));
      return res;
    }
    if (!apiRes.ok || !data) {
      return NextResponse.json(data ?? { message: "Request failed" }, { status: apiRes.status });
    }
    return jsonWithToken(data, cookieName);
  } catch (reason) {
    return upstreamError(reason);
  }
}

/** Clear the auth cookie. */
export function proxyLogout(cookieName: string): NextResponse {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", cookieOptions(0));
  return res;
}
