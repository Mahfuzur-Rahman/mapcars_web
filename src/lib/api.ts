// Mapcars API client.
//
// Authenticated calls go to same-origin BFF routes under /api/bff/* (see
// src/app/api/bff/**). The JWT lives in an httpOnly cookie set by those route
// handlers — it is NEVER read or stored in client-side JS, so XSS cannot steal
// it. Public, unauthenticated calls (health/ping) hit the .NET API directly.

import { env } from "./env";

// ── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch helper ────────────────────────────────────────────────────────

const TIMEOUT_MS = 15_000;

async function http<T>(url: string, method: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiError(0, "Request timed out. Please try again.");
    }
    throw new ApiError(0, "Network error. Please check your connection.");
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = (await res.json()) as Record<string, string>;
      message = err.detail ?? err.message ?? err.title ?? message;
    } catch {
      /* not JSON */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// Same-origin BFF call — the session cookie rides along automatically.
const bff = <T>(method: string, path: string, body?: unknown) =>
  http<T>(`/api/bff${path}`, method, body);

// Direct call to the .NET API — only for public, unauthenticated endpoints.
const direct = <T>(path: string) => http<T>(`${env.apiBaseUrl}${path}`, "GET");

// ── Response types ───────────────────────────────────────────────────────────
// Note: these omit the JWT — it never reaches the browser. Hand-maintained for
// now; should be generated from the API's OpenAPI doc (see project conventions).

export interface AdminResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface MenuResponse {
  id: number;
  name: string;
  path?: string;
  icon?: string;
  parentId?: number;
  sortOrder: number;
  children: MenuResponse[];
}

// Returned by admin login, setup, and /me (token stripped → cookie).
export interface AdminSession {
  expiresInMinutes: number;
  admin: AdminResponse;
  menus: MenuResponse[];
}

// Returned by rider login / verification (token stripped → cookie).
export interface RiderSession {
  expiresInMinutes: number;
  userType: string;
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface OtpSentResponse {
  message: string;
  devCode?: string; // only present in local/dev environment
}

// ── Admin management (SuperAdmin) ────────────────────────────────────────────

export interface AdminListItem {
  id: string;
  email: string;
  fullName: string;
  roleId: number;
  role: string;
  isActive: boolean;
  menuCount: number;
  createdAtUtc: string;
}

// One node of the catalog annotated for a given admin.
export interface MenuAccessItem {
  id: number;
  name: string;
  path?: string;
  icon?: string;
  parentId?: number;
  sortOrder: number;
  allowed: boolean; // effective access for this admin
  roleDefault: boolean; // granted by the admin's role out of the box
  children: MenuAccessItem[];
}

export interface AdminMenuAccess {
  adminId: string;
  email: string;
  roleId: number;
  role: string;
  menus: MenuAccessItem[];
}

// Used by home page
export type HealthResponse = { status: string; service: string };
export type PingResponse = { message: string; utc: string };

// ── Admin auth  (BFF: /api/bff/admin/*) ──────────────────────────────────────

export const adminAuth = {
  /** One-time setup — creates the first SuperAdmin. */
  setup: (email: string, password: string, fullName: string) =>
    bff<AdminSession>("POST", "/admin/setup", {
      email,
      password,
      fullName,
      roleId: 1,
    }),

  login: (email: string, password: string) =>
    bff<AdminSession>("POST", "/admin/login", { email, password }),

  /** Current admin profile + menu tree (also refreshes the session cookie). */
  me: () => bff<AdminSession>("GET", "/admin/me"),

  /** SuperAdmin only — create a new admin. */
  register: (
    email: string,
    password: string,
    fullName: string,
    roleId: number,
  ) =>
    bff<AdminResponse>("POST", "/admin/register", {
      email,
      password,
      fullName,
      roleId,
    }),

  logout: () => bff<{ ok: boolean }>("POST", "/admin/logout"),
};

// ── Admin management  (BFF: /api/bff/admin/*) — SuperAdmin only ──────────────

export const adminManagement = {
  /** List all admins with their effective menu counts. */
  listAdmins: () => bff<AdminListItem[]>("GET", "/admin/admins"),

  /** Full menu catalog (tree). */
  menuCatalog: () => bff<MenuResponse[]>("GET", "/admin/menus"),

  /** One admin's menu access (catalog annotated allowed / roleDefault). */
  getAdminMenus: (adminId: string) =>
    bff<AdminMenuAccess>("GET", `/admin/admins/${adminId}/menus`),

  /** Replace the complete set of menus an admin can see. */
  setAdminMenus: (adminId: string, menuIds: number[]) =>
    bff<AdminMenuAccess>("PUT", `/admin/admins/${adminId}/menus`, { menuIds }),
};

// ── Rider auth  (BFF: /api/bff/rider/*) ──────────────────────────────────────

export const riderAuth = {
  sendOtp: (phone: string) =>
    bff<OtpSentResponse>("POST", "/rider/send-otp", { phone }),

  verifyPhone: (phone: string, code: string) =>
    bff<RiderSession>("POST", "/rider/verify-phone", { phone, code }),

  signup: (email: string, password: string, fullName: string) =>
    bff<OtpSentResponse>("POST", "/rider/signup", { email, password, fullName }),

  resendEmail: (email: string) =>
    bff<OtpSentResponse>("POST", "/rider/resend-email", { email }),

  verifyEmail: (email: string, code: string) =>
    bff<RiderSession>("POST", "/rider/verify-email", { email, code }),

  login: (email: string, password: string) =>
    bff<RiderSession>("POST", "/rider/login", { email, password }),

  google: (idToken: string) =>
    bff<RiderSession>("POST", "/rider/google", { idToken }),

  updateProfile: (fullName: string, email?: string) =>
    bff<RiderSession>("PATCH", "/rider/me", {
      fullName,
      ...(email ? { email } : {}),
    }),

  logout: () => bff<{ ok: boolean }>("POST", "/rider/logout"),
};

// ── Health / ping (used by home page) ────────────────────────────────────────

export const api = {
  health: () => direct<HealthResponse>("/health"),
  ping: () => direct<PingResponse>("/api/v1/ping"),
};
