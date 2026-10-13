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
  (process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:5200");

export const ADMIN_COOKIE = "mc_admin";
export const CUSTOMER_COOKIE = "mc_customer";

/**
 * What the customer session cookie was called before the Rider -> Customer
 * rename. mapcars.uk is live, so renaming the cookie outright would sign every
 * customer out at deploy - and a forced re-login is indistinguishable, from the
 * user's side, from a security incident.
 *
 * So reads fall back to it, writes only ever use the new name, and clearing a
 * session expires both. A session therefore migrates on its owner's next
 * request, with nothing for them to notice. Delete this once the refresh-cookie
 * lifetime above (90 days) has passed since the rename shipped.
 */
const LEGACY_CUSTOMER_COOKIE = "mc_rider";

/** The pre-rename name for a cookie, or null if it never had one. */
function legacyNameFor(cookieName: string): string | null {
  return cookieName === CUSTOMER_COOKIE ? LEGACY_CUSTOMER_COOKIE : null;
}

/** Access-token cookie, preferring the current name and falling back to the old. */
function readAccessCookie(req: NextRequest, cookieName: string): string | undefined {
  const current = req.cookies.get(cookieName)?.value;
  if (current) return current;
  const legacy = legacyNameFor(cookieName);
  return legacy ? req.cookies.get(legacy)?.value : undefined;
}

/** Refresh-token cookie, same fallback. */
function readRefreshCookie(req: NextRequest, cookieName: string): string | undefined {
  const current = req.cookies.get(refreshCookieFor(cookieName))?.value;
  if (current) return current;
  const legacy = legacyNameFor(cookieName);
  return legacy ? req.cookies.get(refreshCookieFor(legacy))?.value : undefined;
}
export const DRIVER_COOKIE = "mc_driver";

const TIMEOUT_MS = 15_000;

/**
 * The refresh-token cookie paired with an access-token cookie ("mc_customer" ->
 * "mc_customer_rt"). Derived rather than declared so every existing
 * `proxyAuthed(..., SOME_COOKIE)` call site gains renewal without being touched.
 */
function refreshCookieFor(cookieName: string): string {
  return `${cookieName}_rt`;
}

/**
 * How long the refresh cookie lives. Matches the API's default
 * `Jwt:RefreshTokenDays`; the API is still the authority — an expired token is
 * rejected there regardless of what the browser kept.
 */
const REFRESH_COOKIE_MAX_AGE = 90 * 24 * 60 * 60;

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * The visitor's real address, as OUR reverse proxy saw it.
 *
 * The API rate-limits anonymous and credential endpoints per client IP. In
 * production the BFF reaches the API container directly (`API_INTERNAL_URL`),
 * so without this every web visitor shares ONE bucket — the web container's —
 * and five contact-form or forgot-password submissions site-wide would lock
 * everyone out for 15 minutes.
 *
 * Only the address Nginx itself observed is forwarded: `X-Real-IP` (Nginx
 * overwrites it with `$remote_addr`), else the RIGHT-most `X-Forwarded-For`
 * entry (Nginx appends, so everything to its left is whatever the browser sent).
 * The API trusts this header only from private hops and unwinds exactly one, so
 * a visitor can't pick their own rate-limit bucket through the web app either.
 */
function clientIpOf(req: NextRequest): string | undefined {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = req.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return hops && hops.length > 0 ? hops[hops.length - 1] : undefined;
}

async function callApi(
  path: string,
  method: string,
  body?: unknown,
  token?: string,
  clientIp?: string,
): Promise<Response> {
  if (!API_BASE) throw new Error("API base URL is not configured");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (clientIp) headers["X-Forwarded-For"] = clientIp;
  console.log(`[BFF] Calling API: ${method} ${API_BASE}${path}`);
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

/**
 * If the upstream body carries credentials, move them into httpOnly cookies and
 * strip them from the response.
 *
 * Both `token` and `refreshToken` must be stripped. The refresh token is the
 * more dangerous of the two to leak — it lives 90 days and mints unlimited
 * access tokens, where the JWT expires in an hour — so letting it through into
 * the JSON body would hand client-side JS a long-lived credential and undo the
 * whole reason this BFF exists.
 */
function jsonWithToken(data: Record<string, unknown> | unknown[], cookieName: string): NextResponse {
  // A JSON array body (e.g. list endpoints) never carries a token — pass it
  // through as-is. Spreading it below would corrupt it into an object.
  if (Array.isArray(data)) return NextResponse.json(data, { status: 200 });

  const { token, refreshToken, expiresInMinutes, ...rest } = data as {
    token?: string;
    refreshToken?: string;
    expiresInMinutes?: number;
  } & Record<string, unknown>;
  const res = NextResponse.json(rest, { status: 200 });
  if (typeof token === "string" && token) {
    res.cookies.set(cookieName, token, cookieOptions((expiresInMinutes ?? 60) * 60));
  }
  if (typeof refreshToken === "string" && refreshToken) {
    res.cookies.set(refreshCookieFor(cookieName), refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));
  }
  return res;
}

/** Result of a server-side token renewal. */
type Renewal = { token: string; refreshToken: string; expiresInMinutes: number };

/**
 * What became of an attempt to renew the session. Only `rejected` ends it:
 * every other failure is the network or a passing server fault, and
 * signing people out for those was the bug.
 */
type RenewOutcome =
  | { kind: "renewed"; renewal: Renewal }
  /** The API answered 401 (expired, revoked or replayed), or there was no refresh cookie. */
  | { kind: "rejected" }
  /** No usable answer: network, timeout, 5xx, 429, or a malformed body. */
  | { kind: "failed" };

/** Trades the refresh cookie for a fresh access token. */
async function renewSession(req: NextRequest, cookieName: string): Promise<RenewOutcome> {
  const refreshToken = readRefreshCookie(req, cookieName);
  if (!refreshToken) return { kind: "rejected" };

  try {
    const apiRes = await callApi("/api/v1/auth/refresh", "POST", { refreshToken }, undefined, clientIpOf(req));
    if (apiRes.status === 401) return { kind: "rejected" };
    if (!apiRes.ok) return { kind: "failed" };

    const renewed = (await readJson(apiRes)) as Partial<Renewal> | null;
    if (!renewed || typeof renewed.token !== "string") return { kind: "failed" };

    return {
      kind: "renewed",
      renewal: {
        token: renewed.token,
        // The API rotates on use, so this differs from what we sent. Storing the
        // successor is mandatory: replaying the old one after the grace window
        // reads as theft server-side and revokes every session the user has.
        refreshToken: typeof renewed.refreshToken === "string" ? renewed.refreshToken : refreshToken,
        expiresInMinutes: typeof renewed.expiresInMinutes === "number" ? renewed.expiresInMinutes : 60,
      },
    };
  } catch {
    return { kind: "failed" };
  }
}

/**
 * The response when renewal didn't produce a session. A rejection ends the
 * session. A failure leaves the cookies exactly as they were, so the next
 * request simply tries again.
 */
function sessionUnavailable(outcome: { kind: "rejected" } | { kind: "failed" }, cookieName: string): NextResponse {
  if (outcome.kind === "rejected") {
    const res = NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    clearSessionCookies(res, cookieName);
    return res;
  }
  return NextResponse.json(
    { message: "We couldn't reach the server to keep you signed in. Please try again." },
    { status: 503 },
  );
}

/** An upstream response, plus any renewal on the way that still has to reach the cookies. */
type Sent = { apiRes: Response; renewal: Renewal | null };

/**
 * Sends a request with the session's access token. It renews first when the
 * access cookie is gone, which is the normal state after an hour away, and
 * once more on a 401.
 *
 * It returns a finished NextResponse when no request could be made with a live
 * session, or when sending threw. In that case any renewal that already
 * happened is still written to the cookies: the API has rotated the old
 * refresh token away, and a browser left holding it would trip theft
 * detection once the grace window passed.
 */
async function sendWithSession(
  req: NextRequest,
  cookieName: string,
  send: (token: string) => Promise<Response>,
): Promise<Sent | NextResponse> {
  let renewal: Renewal | null = null;
  try {
    let token = readAccessCookie(req, cookieName);
    if (!token) {
      const outcome = await renewSession(req, cookieName);
      if (outcome.kind !== "renewed") return sessionUnavailable(outcome, cookieName);
      renewal = outcome.renewal;
      token = renewal.token;
    }

    let apiRes = await send(token);

    // Expired mid-session. A 401 means the API did not act on the request, so
    // replaying it after renewal is safe even for a POST.
    if (apiRes.status === 401 && !renewal) {
      const outcome = await renewSession(req, cookieName);
      if (outcome.kind === "failed") return sessionUnavailable(outcome, cookieName);
      if (outcome.kind === "renewed") {
        renewal = outcome.renewal;
        apiRes = await send(renewal.token);
      }
      // "rejected": fall through with the 401, and the caller clears the cookies.
    }

    return { apiRes, renewal };
  } catch (reason) {
    const res = upstreamError(reason);
    if (renewal) setSessionCookies(res, cookieName, renewal);
    return res;
  }
}

/** Writes renewed credentials onto a response. */
function setSessionCookies(res: NextResponse, cookieName: string, renewed: Renewal): void {
  res.cookies.set(cookieName, renewed.token, cookieOptions(renewed.expiresInMinutes * 60));
  res.cookies.set(refreshCookieFor(cookieName), renewed.refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));
}

/** Expires both halves of the session on a response. */
function clearSessionCookies(res: NextResponse, cookieName: string): void {
  res.cookies.set(cookieName, "", cookieOptions(0));
  res.cookies.set(refreshCookieFor(cookieName), "", cookieOptions(0));
  // Also retire the pre-rename pair, so "log out" genuinely ends the session
  // rather than leaving a cookie the fallback above would happily accept.
  const legacy = legacyNameFor(cookieName);
  if (legacy) {
    res.cookies.set(legacy, "", cookieOptions(0));
    res.cookies.set(refreshCookieFor(legacy), "", cookieOptions(0));
  }
}

/** Forward a POST body and return the upstream response verbatim (no cookie set). */
export async function proxyPublic(req: NextRequest, apiPath: string): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const apiRes = await callApi(apiPath, "POST", body, undefined, clientIpOf(req));
    const data = await readJson(apiRes);
    // 202/204 (and a bare 429 from the rate limiter) carry no body. Serialising
    // that as JSON `null` is not just untidy: a 204 with any body at all makes
    // the Response constructor throw.
    if (!data) return new NextResponse(null, { status: apiRes.status });
    return NextResponse.json(data, { status: apiRes.status });
  } catch (reason) {
    return upstreamError(reason);
  }
}

/** Forward an unauthenticated GET request to the .NET API. */
export async function proxyPublicGet(apiPath: string): Promise<NextResponse> {
  try {
    const apiRes = await callApi(apiPath, "GET");
    const data = await readJson(apiRes);
    return NextResponse.json(data, { status: apiRes.status });
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
    const apiRes = await callApi(apiPath, "POST", body, undefined, clientIpOf(req));
    const data = await readJson(apiRes);
    if (!apiRes.ok || !data) {
      return NextResponse.json(data ?? { message: "Request failed" }, { status: apiRes.status });
    }
    return jsonWithToken(data, cookieName);
  } catch (reason) {
    return upstreamError(reason);
  }
}

/**
 * Forward a login POST whose cookie isn't known until the response comes back
 * — the unified `/auth/login` endpoint returns `userType` ("admin" | "customer" |
 * "driver"), and that's what picks the cookie out of `cookieByRole`.
 */
export async function proxyRoleLogin(
  req: NextRequest,
  apiPath: string,
  cookieByRole: Record<string, string>,
): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const apiRes = await callApi(apiPath, "POST", body, undefined, clientIpOf(req));
    const data = await readJson(apiRes);
    if (!apiRes.ok || !data) {
      return NextResponse.json(data ?? { message: "Request failed" }, { status: apiRes.status });
    }
    // The unified endpoint can ask the client to disambiguate instead of
    // returning a token (e.g. the same email+password matches both a customer
    // and a driver account) — nothing to put in a cookie yet.
    if ((data as { requiresChoice?: boolean }).requiresChoice) {
      return NextResponse.json(data, { status: 200 });
    }
    const userType = (data as { userType?: string }).userType ?? "";
    const cookieName = cookieByRole[userType];
    if (!cookieName) {
      return NextResponse.json({ message: "Unrecognized account type." }, { status: 502 });
    }
    return jsonWithToken(data, cookieName);
  } catch (reason) {
    return upstreamError(reason);
  }
}

/**
 * Attach the cookie's JWT as a bearer. On a missing cookie or a 401, renew the
 * session with the refresh cookie and replay the request. Cookies are cleared
 * only when the API says the session is over.
 *
 * The renewal lives here rather than in each route because every authed BFF
 * route already funnels through this function, so all of them gain it without
 * being touched.
 */
export async function proxyAuthed(
  req: NextRequest,
  apiPath: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  cookieName: string,
): Promise<NextResponse> {
  const hasBody = method !== "GET" && method !== "DELETE";
  // Read the body once: a retry needs it again, and the request stream cannot
  // be consumed twice.
  const body = hasBody ? await req.json().catch(() => ({})) : undefined;

  const sent = await sendWithSession(req, cookieName, (token) =>
    callApi(apiPath, method, body, token, clientIpOf(req)),
  );
  if (sent instanceof NextResponse) return sent;
  const { apiRes, renewal } = sent;

  try {
    const data = await readJson(apiRes);

    if (apiRes.status === 401) {
      // Renewal was impossible or itself rejected: the session is genuinely over.
      const res = NextResponse.json(data ?? { message: "Unauthorized" }, { status: 401 });
      clearSessionCookies(res, cookieName);
      return res;
    }
    if (!apiRes.ok) {
      const res = NextResponse.json(data ?? { message: "Request failed" }, { status: apiRes.status });
      if (renewal) setSessionCookies(res, cookieName, renewal);
      return res;
    }
    if (apiRes.status === 204 || !data) {
      const res = new NextResponse(null, { status: apiRes.status });
      if (renewal) setSessionCookies(res, cookieName, renewal);
      return res;
    }

    const res = jsonWithToken(data, cookieName);
    // jsonWithToken only sets cookies when the *body* carried credentials, which
    // a normal API response doesn't, so a renewal still has to be written here.
    if (renewal) setSessionCookies(res, cookieName, renewal);
    return res;
  } catch (reason) {
    const res = upstreamError(reason);
    if (renewal) setSessionCookies(res, cookieName, renewal);
    return res;
  }
}

/** Forward a multipart/form-data POST (file upload) with the cookie's JWT as a bearer, renewing like proxyAuthed. */
export async function proxyAuthedUpload(
  req: NextRequest,
  apiPath: string,
  cookieName: string,
): Promise<NextResponse> {
  if (!API_BASE) return upstreamError(new Error("API base URL is not configured"));

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (reason) {
    console.error(`[BFF] Upload to ${apiPath}: unreadable form data`, reason);
    return upstreamError(reason);
  }

  const sent = await sendWithSession(req, cookieName, (token) =>
    fetch(`${API_BASE}${apiPath}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      // A FormData is re-serialised on every fetch, so the retry after a
      // renewal can send it again.
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }),
  );
  if (sent instanceof NextResponse) return sent;
  const { apiRes, renewal } = sent;

  try {
    const data = await readJson(apiRes);

    if (apiRes.status === 401) {
      const res = NextResponse.json(data ?? { message: "Unauthorized" }, { status: 401 });
      clearSessionCookies(res, cookieName);
      return res;
    }
    if (!apiRes.ok) {
      // Log the upstream error so it's visible in Next.js server logs.
      console.error(`[BFF] Upload to ${apiPath} failed: HTTP ${apiRes.status}`, data);
    }
    const res = NextResponse.json(data, { status: apiRes.status });
    if (renewal) setSessionCookies(res, cookieName, renewal);
    return res;
  } catch (reason) {
    console.error(`[BFF] Upload to ${apiPath} threw:`, reason);
    const res = upstreamError(reason);
    if (renewal) setSessionCookies(res, cookieName, renewal);
    return res;
  }
}

/**
 * Stream a binary GET (image / PDF) through with the cookie's JWT as a bearer,
 * renewing like proxyAuthed. The file bytes never touch client-side JS
 * storage: they flow straight from the private bucket (via the API) to the
 * browser. It preserves the upstream content-type and forces `nosniff`, so a
 * spoofed type can't be MIME-confused.
 */
export async function proxyAuthedDownload(
  req: NextRequest,
  apiPath: string,
  cookieName: string,
): Promise<NextResponse> {
  if (!API_BASE) return upstreamError(new Error("API base URL is not configured"));

  const sent = await sendWithSession(req, cookieName, (token) =>
    fetch(`${API_BASE}${apiPath}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }),
  );
  if (sent instanceof NextResponse) return sent;
  const { apiRes, renewal } = sent;

  if (apiRes.status === 401) {
    const res = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearSessionCookies(res, cookieName);
    return res;
  }

  let res: NextResponse;
  if (!apiRes.ok || !apiRes.body) {
    res = NextResponse.json({ message: "Not found" }, { status: apiRes.status });
  } else {
    const headers = new Headers();
    headers.set("Content-Type", apiRes.headers.get("Content-Type") ?? "application/octet-stream");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "private, no-store");
    res = new NextResponse(apiRes.body, { status: 200, headers });
  }
  if (renewal) setSessionCookies(res, cookieName, renewal);
  return res;
}

/**
 * Sign out: revoke the refresh token server-side, then clear both cookies.
 *
 * Clearing the cookies alone is not enough any more. The refresh token stays
 * valid at the API for its full 90 days, so a copy taken from the browser (or a
 * shared machine whose cookie jar was captured) would outlive "log out"
 * entirely. Revoking is best-effort — a failure there must never leave someone
 * stuck in a signed-in UI, so the cookies are cleared regardless.
 */
export async function proxyLogout(req: NextRequest, cookieName: string): Promise<NextResponse> {
  const refreshToken = readRefreshCookie(req, cookieName);
  if (refreshToken) {
    try {
      await callApi("/api/v1/auth/logout", "POST", { refreshToken }, undefined, clientIpOf(req));
    } catch {
      /* local sign-out proceeds regardless */
    }
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res, cookieName);
  return res;
}
