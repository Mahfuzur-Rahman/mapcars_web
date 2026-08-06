// Environment configuration — driven entirely by NEXT_PUBLIC_* env vars.
//
// Switch target environment:
//   Local dev  → .env.local        → NEXT_PUBLIC_APP_ENV=local
//   Staging    → .env.staging      → NEXT_PUBLIC_APP_ENV=staging
//   Production → .env.production   → NEXT_PUBLIC_APP_ENV=prod
//
// Fail-fast: a *production* build throws if a required var is missing instead of
// silently falling back to a dev value (which previously could turn `isDev` on in
// prod and leak dev-only affordances like OTP codes).

export type AppEnv = "local" | "staging" | "prod";

const isProductionBuild = process.env.NODE_ENV === "production";

/** Returns the value, or a dev fallback. In a production build a missing value throws. */
function requireInProd(
  name: string,
  value: string | undefined,
  devFallback: string,
): string {
  if (value && value.trim() !== "") return value;
  if (isProductionBuild) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return devFallback;
}

const appEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? "local") as AppEnv;

export const env = {
  name: appEnv,
  apiBaseUrl: requireInProd(
    "NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_API_URL,
    "http://localhost:5200",
  ),
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
  // Browser key for the Google Maps JavaScript API (admin live map). Must have
  // "Maps JavaScript API" enabled + an HTTP-referrer restriction for the web
  // origin. Empty → the live map degrades to a data-only list.
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  // OAuth 2.0 **Web** client ID for "Continue with Google" (Google Identity
  // Services). The same value must be in the API's `Google:ClientId` audience
  // list, or it will reject the ID token. Empty → the button still renders but
  // tells the user Google sign-in isn't set up yet.
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  // Dev-only affordances (e.g. showing OTP codes in the UI) are NEVER enabled in a
  // production build, even if NEXT_PUBLIC_APP_ENV is misconfigured.
  get isDev() {
    return appEnv === "local" && !isProductionBuild;
  },
};
