// Mapcars API client.
//
// Authenticated calls go to same-origin BFF routes under /api/bff/* (see
// src/app/api/bff/**). The JWT lives in an httpOnly cookie set by those route
// handlers — it is NEVER read or stored in client-side JS, so XSS cannot steal
// it. Public, unauthenticated calls (health/ping) hit the .NET API directly.

import { env } from "./env";
import { hideTopProgress, showTopProgress } from "@/components/ui/TopProgressBar";

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
  const isBrowser = typeof window !== "undefined";
  if (isBrowser) showTopProgress();

  try {
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
  } finally {
    if (isBrowser) hideTopProgress();
  }
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

// Returned by customer login / verification (token stripped → cookie).
export interface CustomerSession {
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

// Returned by driver login (token stripped → cookie).
export interface DriverSession {
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

// Returned by the unified login (token stripped → cookie set based on role).
// Only the fields for the matched `userType` are populated.
export interface UnifiedSession {
  /** True when the email+password matched more than one account — see `availableUserTypes`. */
  requiresChoice?: boolean;
  availableUserTypes?: ("customer" | "driver")[];

  expiresInMinutes: number;
  userType: "admin" | "customer" | "driver" | "";
  userId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  isProfileComplete?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  admin?: AdminResponse;
  menus?: MenuResponse[];
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

// ── Unified auth  (BFF: /api/bff/auth/login) ─────────────────────────────────
// The web app's one sign-in surface — detects Admin/Customer/Driver from the
// submitted credentials. See `web/src/app/auth/login/page.tsx`.

export const unifiedAuth = {
  /** `loginAs` is only needed on a second call, after the first came back with `requiresChoice`. */
  login: (email: string, password: string, loginAs?: "customer" | "driver") =>
    bff<UnifiedSession>("POST", "/auth/login", { email, password, loginAs }),

  /** Google sign-in for the unified web login endpoint (detects customer vs driver). */
  google: (idToken: string, signUp = false, loginAs?: "customer" | "driver") =>
    bff<UnifiedSession>("POST", "/auth/google", { idToken, signUp, loginAs }),
};

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

  /** Changes the signed-in admin's own password. */
  changePassword: (currentPassword: string, newPassword: string) =>
    bff<void>("POST", "/admin/me/change-password", { currentPassword, newPassword }),
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

// ── Fare chart  (BFF: /api/bff/admin/fare-chart) — SuperAdmin edits ──────────
// Mirrors Mapcars.Application.Pricing.Models.FareChart. All money is integer
// pence; multipliers/percent are decimals. Publishing bumps the version and
// takes effect immediately (the API updates its in-memory cache on write).

export interface FareTier {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseFarePence: number;
  multiplier: number;
  capacity: number;
  etaMinutes: number;
}

export interface RushHourRule {
  days: number[]; // ISO weekdays 1=Mon … 7=Sun; empty = every day
  from: string; // "HH:mm" (local); windows may wrap past midnight
  to: string;
  multiplier: number;
}

export interface ZoneSurcharge {
  id: string;
  type: string; // e.g. "airport" | "station"
  lat: number;
  lng: number;
  radiusM: number;
  surchargePence: number;
  appliesToPickup: boolean;
  appliesToDropoff: boolean;
}

export interface BusyArea {
  lat: number;
  lng: number;
  radiusM: number;
  multiplier: number;
}

export interface OutsideCityRule {
  cityLat: number;
  cityLng: number;
  radiusM: number;
  multiplier: number;
}

export interface FareChart {
  version: number;
  currency: string;
  updatedAtUtc: string;
  base: { bookingFeePence: number; minimumFarePence: number };
  rates: { perMilePence: number; perMinutePence: number };
  tiers: FareTier[];
  modifiers: {
    rushHour: RushHourRule[];
    zones: ZoneSurcharge[];
    busyAreas: BusyArea[];
    outsideCity: OutsideCityRule | null;
  };
  platform: { driverFeePercent: number };
}

export const fareChart = {
  /** The current live fare chart. */
  get: () => bff<FareChart>("GET", "/admin/fare-chart"),
  /** Publish a new version (SuperAdmin only). Returns it with its new version. */
  update: (chart: FareChart) => bff<FareChart>("PUT", "/admin/fare-chart", chart),
};

// ── Payment settings  (BFF: /api/bff/admin/payment-settings) ─────────────────

export type PaymentMethodName = "Cash" | "Card";

export interface PaymentSettings {
  cashEnabled: boolean;
  cardEnabled: boolean;
  /** Which method the apps preselect. Never names a disabled method — the API
   *  corrects it on write rather than rejecting the change. */
  defaultMethod: PaymentMethodName;
}

export interface DriverPaymentOptions {
  driverId: string;
  /** null = follow the global setting. The tri-state is deliberate: it lets an
   *  admin CLEAR an override, not only flip it. */
  acceptsCashOverride: boolean | null;
  acceptsCardOverride: boolean | null;
  /** The override resolved against the global toggles, which act as a ceiling. */
  effectiveAcceptsCash: boolean;
  effectiveAcceptsCard: boolean;
}

export const paymentSettings = {
  /** The current global toggles. */
  get: () => bff<PaymentSettings>("GET", "/admin/payment-settings"),
  /** Publish new toggles (SuperAdmin only). At least one method must stay on. */
  update: (settings: PaymentSettings) =>
    bff<PaymentSettings>("PUT", "/admin/payment-settings", settings),

  /** One driver's overrides, with the effective result resolved. */
  getDriver: (driverId: string) =>
    bff<DriverPaymentOptions>("GET", `/admin/payment-settings/drivers/${driverId}`),
  /** Set or clear one driver's overrides. Send null to clear. */
  updateDriver: (
    driverId: string,
    options: Pick<DriverPaymentOptions, "acceptsCashOverride" | "acceptsCardOverride">,
  ) => bff<DriverPaymentOptions>("PUT", `/admin/payment-settings/drivers/${driverId}`, options),
};

// ── Customer auth  (BFF: /api/bff/customer/*) ──────────────────────────────────────

export const customerAuth = {
  sendOtp: (phone: string) =>
    bff<OtpSentResponse>("POST", "/customer/send-otp", { phone }),

  verifyPhone: (phone: string, code: string) =>
    bff<CustomerSession>("POST", "/customer/verify-phone", { phone, code }),

  signup: (email: string, password: string, fullName: string) =>
    bff<OtpSentResponse>("POST", "/customer/signup", { email, password, fullName }),

  resendEmail: (email: string) =>
    bff<OtpSentResponse>("POST", "/customer/resend-email", { email }),

  verifyEmail: (email: string, code: string) =>
    bff<CustomerSession>("POST", "/customer/verify-email", { email, code }),

  /**
   * `signUp` must be true only from the create-account page. From the sign-in
   * page it stays false, so a Google account with no Mapcars account is told to
   * sign up instead of silently becoming a new customer.
   */
  google: (idToken: string, signUp = false) =>
    bff<CustomerSession>("POST", "/customer/google", { idToken, signUp }),

  /** Current customer's profile (Wave 1 profile/compliance fields). */
  getProfile: () => bff<CustomerProfileResponse>("GET", "/customer/me"),

  updateProfile: (
    fullName: string,
    opts?: {
      email?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      marketingConsent?: boolean;
      accessibilityNeeds?: string;
    },
  ) =>
    bff<CustomerProfileResponse>("PATCH", "/customer/me", {
      fullName,
      ...(opts?.email ? { email: opts.email } : {}),
      ...(opts?.emergencyContactName
        ? { emergencyContactName: opts.emergencyContactName }
        : {}),
      ...(opts?.emergencyContactPhone
        ? { emergencyContactPhone: opts.emergencyContactPhone }
        : {}),
      ...(opts?.marketingConsent !== undefined
        ? { marketingConsent: opts.marketingConsent }
        : {}),
      ...(opts?.accessibilityNeeds ? { accessibilityNeeds: opts.accessibilityNeeds } : {}),
    }),

  logout: () => bff<{ ok: boolean }>("POST", "/customer/logout"),
};

// Returned by GET/PATCH /api/v1/auth/customers/me. PATCH used to return the
// shared CustomerSession — it now returns this shape instead (breaking change,
// intentional — see Wave 1 profile/compliance-fields project).
export interface CustomerProfileResponse {
  customerId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  marketingConsent: boolean;
  accessibilityNeeds?: string;
  isProfileComplete: boolean;
}

// ── Customer trips  (BFF: /api/bff/customer/trips) ─────────────────────────────────

export interface TripSummary {
  id: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  status: string;
  fareAmount?: number;
  tipAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAtUtc: string | null;
  createdAtUtc: string;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
  cancelledReason: string | null;
  isNoShow: boolean;
}

export const customerTrips = {
  /** The current customer's own trip history. */
  list: () => bff<TripSummary[]>("GET", "/customer/trips"),
};

// ── Saved places  (BFF: /api/bff/saved-places) — customer only ──────────────────

export interface SavedPlaceResponse {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface UpsertSavedPlaceRequest {
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export const savedPlaces = {
  list: () => bff<SavedPlaceResponse[]>("GET", "/saved-places"),

  create: (place: UpsertSavedPlaceRequest) =>
    bff<SavedPlaceResponse>("POST", "/saved-places", place),

  update: (id: string, place: UpsertSavedPlaceRequest) =>
    bff<SavedPlaceResponse>("PUT", `/saved-places/${id}`, place),

  remove: (id: string) => bff<void>("DELETE", `/saved-places/${id}`),
};

// ── Driver auth  (BFF: /api/bff/driver/*) ────────────────────────────────────
// Driver accounts are created via the driver_app mobile onboarding flow, not
// the web — so only login/logout are exposed here (no signup/OTP).

export const driverAuth = {
  /** Current driver's full profile (also used for the web dashboard). */
  getProfile: () => bff<DriverProfileResponse>("GET", "/driver/me"),

  updateProfile: (req: UpdateDriverProfileRequest) =>
    bff<DriverProfileResponse>("PATCH", "/driver/me", req),

  logout: () => bff<{ ok: boolean }>("POST", "/driver/logout"),
};

// Returned by GET /api/v1/auth/drivers/me.
export interface DriverProfileResponse {
  driverId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  nationalIdNumber?: string;
  drivingLicenceNumber?: string;
  passportNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  marketingConsent: boolean;
  status: string; // "PendingApproval" | "Approved" | "Suspended" | "Rejected"
  isOnline: boolean;
  isProfileComplete: boolean;
  averageRating: number | null;
  ratingCount: number;
  cancellationCount: number;
  noShowCount: number;
  createdAtUtc: string;
}

// Body for PATCH /api/v1/auth/drivers/me — firstName/nationalIdNumber required.
export interface UpdateDriverProfileRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string; // "YYYY-MM-DD"
  address?: string;
  nationalIdNumber: string;
  drivingLicenceNumber?: string;
  passportNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  marketingConsent?: boolean;
}

// ── Driver trips  (BFF: /api/bff/driver/trips) ───────────────────────────────

export interface DriverTripSummary {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  fareAmount?: number;
  tipAmount: number;
  driverEarnings?: number;
  createdAtUtc: string;
  completedAtUtc: string | null;
}

export const driverTrips = {
  /** The current driver's own trip history. */
  list: () => bff<DriverTripSummary[]>("GET", "/driver/trips"),
};

// ── Documents  (BFF: /api/bff/{customer,driver}/documents) ──────────────────────
// Customer document types: identity/address proof. Driver document types: PHV
// licence/vehicle docs. The API rejects a type that doesn't match the caller's
// role — see Mapcars.Application.Documents.Services.DocumentService.

export type CustomerDocumentType = "ProofOfIdentity" | "ProofOfAddress";
export type DriverDocumentType =
  | "PhvLicence"
  | "VehicleInsurance"
  | "VehicleRegistration"
  | "DbsCheck"
  | "VehicleFrontPhoto"
  | "VehicleRearPhoto"
  | "VehicleInteriorPhoto"
  | "Passport"
  | "DrivingLicence"
  | "VehicleBadge"
  | "BankStatement"
  | "ProofOfAddress";

export interface DocumentSummary {
  id: string;
  type: string;
  originalFileName: string;
  reviewStatus: string;
  createdAtUtc: string;
  reviewedAtUtc?: string;
  // Required by the API for expiring types (PhvLicence, VehicleInsurance,
  // VehicleRegistration, DbsCheck); absent for the rest.
  expiresOn?: string;
  isDeletionRequested?: boolean;
  deletionReason?: string;
  deletionRequestedAtUtc?: string;
}

async function uploadDocument(
  basePath: "/customer/documents" | "/driver/documents",
  type: string,
  file: File,
  expiresOn?: string,
): Promise<DocumentSummary> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
  if (expiresOn) formData.append("expiresOn", expiresOn);

  const res = await fetch(`/api/bff${basePath}`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, string>;
    throw new ApiError(res.status, err.detail ?? err.message ?? err.title ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<DocumentSummary>;
}

export const customerDocuments = {
  upload: (type: CustomerDocumentType, file: File, expiresOn?: string) =>
    uploadDocument("/customer/documents", type, file, expiresOn),
  list: () => bff<DocumentSummary[]>("GET", "/customer/documents"),
  requestDeletion: (documentId: string, reason?: string) =>
    bff<DocumentSummary>("POST", `/customer/documents/${documentId}/request-deletion`, { reason }),
  contentUrl: (documentId: string) =>
    `/api/bff/customer/documents/${documentId}/content`,
};

export const driverDocuments = {
  upload: (type: DriverDocumentType, file: File, expiresOn?: string) =>
    uploadDocument("/driver/documents", type, file, expiresOn),
  list: () => bff<DocumentSummary[]>("GET", "/driver/documents"),
  requestDeletion: (documentId: string, reason?: string) =>
    bff<DocumentSummary>("POST", `/driver/documents/${documentId}/request-deletion`, { reason }),
  contentUrl: (documentId: string) =>
    `/api/bff/driver/documents/${documentId}/content`,
};

// ── Driver payouts  (BFF: /api/bff/driver/{payout-account,payouts}) ──────────

export interface PayoutAccountStatus {
  status: string; // "NotStarted" | "OnboardingIncomplete" | "Complete" | "Restricted"
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
}

export interface PayoutSummary {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAtUtc: string;
  arrivedAtUtc?: string;
}

export const driverPayouts = {
  getAccountStatus: () => bff<PayoutAccountStatus>("GET", "/driver/payout-account"),

  /** Kicks off (or resumes) Stripe Connect onboarding; returns a URL to redirect the driver to. */
  startOnboarding: (refreshUrl: string, returnUrl: string) =>
    bff<{ url: string }>("POST", "/driver/payout-account/onboarding-link", {
      refreshUrl,
      returnUrl,
    }),

  listPayouts: () => bff<PayoutSummary[]>("GET", "/driver/payouts"),
};

// ── Admin driver review  (BFF: /api/bff/admin/driver-review/*) ───────────────
// SuperAdmin or Admin. Review a driver's uploaded KYC/vehicle documents, view
// each file (streamed, never a public URL), approve/reject them, and set the
// driver's overall status.

export type DriverStatus = "PendingApproval" | "Approved" | "Suspended" | "Rejected";
export type DocumentReviewStatus = "Pending" | "Approved" | "Rejected";

export interface DriverReviewListItem {
  driverId: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  status: DriverStatus;
  documentCount: number;
  pendingDocumentCount: number;
  expiredDocumentCount: number;
  createdAtUtc: string;
}

export interface VehicleResponse {
  id: string;
  make: string;
  model: string;
  year: number;
  colour: string;
  registrationNumber: string;
  phvLicencePlateNumber?: string;
  phvLicensingAuthority?: string;
  tier: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface DriverReviewDetail {
  driverId: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  nationalIdNumber?: string;
  phvLicenceNumber?: string;
  drivingLicenceNumber?: string;
  passportNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  marketingConsent: boolean;
  status: DriverStatus;
  hasProfilePicture: boolean;
  vehicle?: VehicleResponse;
  documents: DocumentSummary[];
  averageRating: number | null;
  ratingCount: number;
  cancellationCount: number;
  noShowCount: number;
  isOnline: boolean;
}

export interface VehicleTierAppealResponse {
  id: string;
  driverId: string;
  vehicleId: string;
  currentTier: string;
  requestedTier: string;
  reason: string;
  photoUrls: string[];
  status: "Pending" | "Approved" | "Rejected";
  adminNotes?: string;
  reviewedAtUtc?: string;
  createdAtUtc: string;
}

export interface TierAppealListItem {
  id: string;
  driverId: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
  vehicleId: string;
  vehicleDescription: string;
  registrationNumber: string;
  currentTier: string;
  requestedTier: string;
  reason: string;
  photoCount: number;
  status: "Pending" | "Approved" | "Rejected";
  adminNotes?: string;
  reviewedAtUtc?: string;
  createdAtUtc: string;
}

export interface DriverDocumentListItem {
  id: string;
  driverId: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
  driverStatus: string;
  type: string;
  storageKey: string;
  originalFileName: string;
  contentType: string;
  reviewStatus: "Pending" | "Approved" | "Rejected";
  reviewedAtUtc?: string;
  expiresOn?: string;
  createdAtUtc: string;
}

export const adminDriverReview = {
  listDrivers: (status?: DriverStatus) =>
    bff<DriverReviewListItem[]>(
      "GET",
      `/admin/driver-review/drivers${status ? `?status=${status}` : ""}`,
    ),

  listDocuments: (status?: "Pending" | "Approved" | "Rejected") =>
    bff<DriverDocumentListItem[]>(
      "GET",
      `/admin/driver-review/documents${status ? `?status=${status}` : ""}`,
    ),

  getDriver: (driverId: string) =>
    bff<DriverReviewDetail>("GET", `/admin/driver-review/drivers/${driverId}`),

  reviewDocument: (documentId: string, status: "Approved" | "Rejected") =>
    bff<DocumentSummary>(
      "PUT",
      `/admin/driver-review/documents/${documentId}/review`,
      { status },
    ),

  reviewDocumentDeletion: (documentId: string, status: "Approved" | "Rejected") =>
    bff<DocumentSummary>(
      "PUT",
      `/admin/driver-review/documents/${documentId}/deletion-review`,
      { status },
    ),

  listDocumentDeletions: () =>
    bff<DriverDocumentListItem[]>(
      "GET",
      "/admin/driver-review/document-deletions",
    ),

  setDriverStatus: (driverId: string, status: DriverStatus) =>
    bff<DriverReviewDetail>(
      "PUT",
      `/admin/driver-review/drivers/${driverId}/status`,
      { status },
    ),

  setVehicleTier: (driverId: string, tier: string) =>
    bff<VehicleResponse>(
      "PUT",
      `/admin/driver-review/drivers/${driverId}/tier`,
      { tier },
    ),

  getDriverAppeals: (driverId: string) =>
    bff<VehicleTierAppealResponse[]>(
      "GET",
      `/admin/driver-review/drivers/${driverId}/appeals`,
    ),

  listTierAppeals: (status?: "Pending" | "Approved" | "Rejected") =>
    bff<TierAppealListItem[]>(
      "GET",
      `/admin/driver-review/tier-appeals${status ? `?status=${status}` : ""}`,
    ),

  reviewTierAppeal: (appealId: string, status: "Approved" | "Rejected", adminNotes?: string) =>
    bff<VehicleTierAppealResponse>(
      "PUT",
      `/admin/driver-review/tier-appeals/${appealId}/review`,
      { status, adminNotes },
    ),

  /** Same-origin URL that streams an appeal's photo bytes. */
  appealPhotoUrl: (appealId: string, photoIndex: number) =>
    `/api/bff/admin/driver-review/tier-appeals/${appealId}/photos/${photoIndex}/content`,

  /** Same-origin URL that streams a document's bytes (use as <img src> / <iframe src>). */
  documentContentUrl: (documentId: string) =>
    `/api/bff/admin/driver-review/documents/${documentId}/content`,
};

// ── Admin customers  (BFF: /api/bff/admin/customers) — SuperAdmin or Admin ─────────

export interface AdminCustomerListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAtUtc: string;
}

export const adminCustomers = {
  list: () => bff<AdminCustomerListItem[]>("GET", "/admin/customers"),
  get: (id: string) => bff<AdminCustomerListItem>("GET", `/admin/customers/${id}`),
};

// ── Admin reporting  (BFF: /api/bff/admin/{stats,trips,live}) ────────────────
// Read-only dashboard/trip-history/live-map data. SuperAdmin or Admin.

export interface AdminStats {
  totalCustomers: number;
  totalDrivers: number;
  onlineDrivers: number;
  pendingDriverApprovals: number;
  activeTrips: number;
  tripsToday: number;
  completedTripsToday: number;
  revenueTodayGbp: number;
}

export type TripStatusName =
  | "Requested"
  | "DriverAssigned"
  | "DriverArrived"
  | "InProgress"
  | "Completed"
  // Two spellings on purpose, for the length of the Rider -> Customer rename.
  // The API still emits CancelledByRider today (the value is persisted in
  // trips."Status", so it only flips with migration 031); CancelledByCustomer is
  // what it will emit afterwards. Handling both means this app survives the
  // cutover without a redeploy. Drop CancelledByRider once 031 has shipped.
  | "CancelledByRider"
  | "CancelledByCustomer"
  | "CancelledByDriver"
  // Nobody accepted the request before its search window ran out. Distinct from
  // a cancellation: no one walked away, the platform found no driver.
  | "Expired";

export interface AdminTripListItem {
  id: string;
  customerName?: string;
  driverName?: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: TripStatusName;
  tier?: string;
  fareAmount?: number;
  tipAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAtUtc: string;
  completedAtUtc?: string;
  cancelledAtUtc?: string;
}

export interface AdminActiveTrip {
  id: string;
  status: TripStatusName;
  customerName?: string;
  driverName?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
}

export interface AdminOnlineDriver {
  driverId: string;
  name?: string;
  lat: number;
  lng: number;
  heading?: number;
}

export interface AdminLive {
  activeTrips: AdminActiveTrip[];
  onlineDrivers: AdminOnlineDriver[];
}

export const adminReports = {
  /** Dashboard headline counts. */
  stats: () => bff<AdminStats>("GET", "/admin/stats"),

  /** Trip history, most recent first. */
  listTrips: (opts?: { status?: TripStatusName; skip?: number; take?: number }) => {
    const p = new URLSearchParams();
    if (opts?.status) p.set("status", opts.status);
    if (opts?.skip != null) p.set("skip", String(opts.skip));
    if (opts?.take != null) p.set("take", String(opts.take));
    const q = p.toString();
    return bff<AdminTripListItem[]>("GET", `/admin/trips${q ? `?${q}` : ""}`);
  },

  /** Live map: in-flight trips + online drivers. */
  live: () => bff<AdminLive>("GET", "/admin/live"),
};

// ── Posters  (BFF: /api/bff/admin/posters) — SuperAdmin or Admin ────────────
// Landing-page promo banners. Admin CRUD goes through the BFF; the image and
// the active-poster list are public/unauthenticated on the API, so the
// landing page (and the admin thumbnail preview) hits the API directly.

export interface PosterResponse {
  id: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAtUtc: string;
}

export interface UpsertPosterFields {
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

/** Same-origin URL that streams a poster's image (public via BFF proxy). */
export const posterImageUrl = (id: string) => `/api/bff/posters/${id}/image`;

async function uploadPoster(
  basePath: string,
  file: File,
  fields: UpsertPosterFields,
): Promise<PosterResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (fields.title) formData.append("Title", fields.title);
  if (fields.subtitle) formData.append("Subtitle", fields.subtitle);
  if (fields.linkUrl) formData.append("LinkUrl", fields.linkUrl);
  formData.append("SortOrder", String(fields.sortOrder));
  formData.append("IsActive", String(fields.isActive));

  const res = await fetch(`/api/bff${basePath}`, { method: "POST", body: formData, cache: "no-store" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, string>;
    throw new ApiError(res.status, err.detail ?? err.message ?? err.title ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<PosterResponse>;
}

async function uploadPosterImage(basePath: string, file: File): Promise<PosterResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/bff${basePath}`, { method: "POST", body: formData, cache: "no-store" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, string>;
    throw new ApiError(res.status, err.detail ?? err.message ?? err.title ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<PosterResponse>;
}

export const posters = {
  /** Public — active posters, ordered for display. Feeds the landing page via BFF proxy. */
  listActive: () => bff<PosterResponse[]>("GET", "/posters/active"),
};

export const adminPosters = {
  /** Admin — every poster (active or not), ordered. */
  list: () => bff<PosterResponse[]>("GET", "/admin/posters"),

  create: (file: File, fields: UpsertPosterFields) =>
    uploadPoster("/admin/posters", file, fields),

  update: (id: string, fields: UpsertPosterFields) =>
    bff<PosterResponse>("PUT", `/admin/posters/${id}`, fields),

  /** Replaces the image only — the API endpoint takes just the file, no metadata fields. */
  replaceImage: (id: string, file: File) => uploadPosterImage(`/admin/posters/${id}/image`, file),

  remove: (id: string) => bff<void>("DELETE", `/admin/posters/${id}`),
};

// ── Error logger ─────────────────────────────────────────────────────────────

export type ErrorLogSource = "Api" | "Web" | "CustomerApp" | "DriverApp";
export type ErrorLogLevel = "Warning" | "Error" | "Fatal";

export interface ErrorLogListItem {
  id: string;
  source: ErrorLogSource;
  level: ErrorLogLevel;
  message: string;
  exceptionType: string | null;
  path: string | null;
  statusCode: number | null;
  userType: string | null;
  isResolved: boolean;
  createdAtUtc: string;
}

export interface ErrorLogDetail extends ErrorLogListItem {
  stackTrace: string | null;
  httpMethod: string | null;
  userId: string | null;
  appVersion: string | null;
  platform: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  correlationId: string | null;
  resolvedAtUtc: string | null;
}

export interface ErrorLogPage {
  items: ErrorLogListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ErrorLogSummary {
  total: number;
  unresolved: number;
  lastDay: number;
  errorLevel: number;
  warningLevel: number;
}

export interface ErrorLogFilters {
  source?: string;
  level?: string;
  resolved?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const adminErrorLogs = {
  list: (filters: ErrorLogFilters = {}) => {
    const q = new URLSearchParams();
    if (filters.source) q.set("source", filters.source);
    if (filters.level) q.set("level", filters.level);
    if (filters.resolved !== undefined) q.set("resolved", String(filters.resolved));
    if (filters.search) q.set("search", filters.search);
    q.set("page", String(filters.page ?? 1));
    q.set("pageSize", String(filters.pageSize ?? 50));
    return bff<ErrorLogPage>("GET", `/admin/error-logs?${q}`);
  },

  summary: () => bff<ErrorLogSummary>("GET", "/admin/error-logs/summary"),

  get: (id: string) => bff<ErrorLogDetail>("GET", `/admin/error-logs/${id}`),

  setResolved: (id: string, resolved: boolean) =>
    bff<void>("PATCH", `/admin/error-logs/${id}/resolved`, { resolved }),
};

// ── Email ─────────────────────────────────────────────────────────────────────

export type EmailCategory = "System" | "Compose" | string;
export type EmailStatus = "Sent" | "Failed";

export interface EmailLogListItem {
  id: string;
  toEmail: string;
  fromAddress: string;
  subject: string;
  provider: string;
  category: EmailCategory;
  status: EmailStatus;
  createdAtUtc: string;
}

export interface EmailLogDetail extends EmailLogListItem {
  fromName: string | null;
  bodyHtml: string;
  errorMessage: string | null;
  sentByAdminId: string | null;
}

export interface EmailLogPage {
  items: EmailLogListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmailFilters {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ComposeEmailRequest {
  to: string;
  subject: string;
  bodyHtml: string;
  fromAddress: string;
  fromName?: string;
}

export const adminEmails = {
  list: (filters: EmailFilters = {}) => {
    const q = new URLSearchParams();
    if (filters.category) q.set("category", filters.category);
    if (filters.status) q.set("status", filters.status);
    if (filters.search) q.set("search", filters.search);
    q.set("page", String(filters.page ?? 1));
    q.set("pageSize", String(filters.pageSize ?? 50));
    return bff<EmailLogPage>("GET", `/admin/emails?${q}`);
  },

  get: (id: string) => bff<EmailLogDetail>("GET", `/admin/emails/${id}`),

  compose: (request: ComposeEmailRequest) => bff<void>("POST", "/admin/emails", request),
};

/**
 * Reports a web-side failure to the central error log.
 *
 * Goes straight to the API rather than through the BFF, and deliberately does
 * NOT use `http()`: this runs *while something is already broken*, so it must
 * not show the progress bar, must not throw, and must not depend on a working
 * session. Everything here is best-effort and silent — a failed error report is
 * not worth a second error.
 */
export function reportError(
  error: unknown,
  context: { path?: string; level?: ErrorLogLevel } = {},
): void {
  try {
    const err = error instanceof Error ? error : undefined;
    const message = err?.message ?? String(error ?? "Unknown error");

    // Never report our own API failures — the API already logged those itself
    // when it produced them, and echoing them back would double every entry.
    if (error instanceof ApiError) return;

    const body = JSON.stringify({
      source: "Web",
      level: context.level ?? "Error",
      message,
      exceptionType: err?.name ?? typeof error,
      stackTrace: err?.stack ?? null,
      path:
        context.path ??
        (typeof window !== "undefined" ? window.location.pathname : null),
      platform: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 50) : null,
    });

    void fetch(`${env.apiBaseUrl}/api/v1/error-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true, // survives a navigation away from the broken page
    }).catch(() => {
      /* reporting is best-effort */
    });
  } catch {
    /* reporting must never throw */
  }
}

// ── Health / ping (used by home page) ────────────────────────────────────────

export const api = {
  health: () => direct<HealthResponse>("/health"),
  ping: () => direct<PingResponse>("/api/v1/ping"),
};
