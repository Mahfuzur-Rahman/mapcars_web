# Mapcars Web — Developer Guide & File Map

A map of **what lives where** and **where to go when you need to change something**.
Read this first; it’ll save you grepping.

> **Read this too:** [AGENTS.md](AGENTS.md) — this is **Next.js 16**, which has breaking
> changes vs. older versions you may know (e.g. middleware is now `proxy.ts`,
> `cookies()` is async). When in doubt, check `node_modules/next/dist/docs/`.

---

## 1. The golden rules (don’t break these)

1. **The web app owns no business data.** It is a pure client of the .NET API.
   It never connects to a database. (See the root `../CLAUDE.md`.)
2. **The JWT never touches client-side JavaScript.** It is stored in an
   `httpOnly` cookie set by our own server routes (the “BFF”). This is what makes
   an XSS bug unable to steal a session. Do **not** reintroduce `localStorage`
   tokens.
3. **Every authenticated call goes through `/api/bff/*`** (same-origin). Only
   public, unauthenticated calls (health/ping) hit the API directly.
4. **Response shapes mirror the API contract.** They’re hand-written in
   `src/lib/api.ts` today and should eventually be generated from the API’s
   OpenAPI doc — never let them silently drift from the API.

---

## 2. Directory map

```
web/
├─ src/
│  ├─ app/                         ← all routes & UI (Next.js App Router)
│  │  ├─ layout.tsx                Root layout: fonts, <html>, global metadata
│  │  ├─ page.tsx                  Home page (shows live API connection status)
│  │  ├─ error.tsx                 Global error boundary (recoverable fallback)
│  │  ├─ not-found.tsx             404 page
│  │  ├─ globals.css               Tailwind v4 global styles
│  │  │
│  │  ├─ admin/                    Admin portal
│  │  │  ├─ layout.tsx             Admin shell (sidebar/menus); loads session via me()
│  │  │  ├─ page.tsx               Admin dashboard
│  │  │  └─ login/page.tsx         Redirect stub → /auth/login (old bookmarks only)
│  │  │
│  │  ├─ auth/                     Sign-in + rider (customer) auth flow
│  │  │  ├─ login/page.tsx         THE sign-in page — email (all roles) + phone (rider OTP)
│  │  │  ├─ driver/login/page.tsx  Redirect stub → /auth/login (old bookmarks only)
│  │  │  ├─ signup/page.tsx        Email + phone signup (tabbed) — rider only
│  │  │  ├─ verify/page.tsx        OTP code entry (phone & email)
│  │  │  └─ profile/page.tsx       Post-signup profile setup
│  │  │
│  │  └─ api/bff/                  ← BFF: our server-side auth proxy (see §4)
│  │     ├─ auth/login/            THE unified login route — role decided by the API's response
│  │     ├─ admin/                 setup, me, register, logout (login moved to auth/login)
│  │     └─ rider/                 send-otp, signup, verify-phone,
│  │                               verify-email, google, me, logout (login moved to auth/login)
│  │
│  ├─ app/icon.svg                 Browser-tab favicon (Next file convention)
│  │
│  ├─ components/
│  │  ├─ auth/AuthShell.tsx        Split-screen shell for the signed-out auth screens
│  │  └─ ui/                       ← shared UI kit for the signed-in portals (§6)
│  │     ├─ AppShell.tsx           Sidebar + responsive drawer used by all 3 portals
│  │     ├─ Logo.tsx               MapCars mark (LogoMark / LogoTile)
│  │     ├─ Icon.tsx               Inline SVG set, keyed by the API's menu icon names
│  │     ├─ Card / StatCard        Surfaces and headline-number tiles
│  │     ├─ Badge / QuickLink      Status pills, shortcut cards
│  │     ├─ Page.tsx               Page, PageHeader, SectionTitle
│  │     ├─ Feedback.tsx           Skeleton, ErrorBanner, EmptyState, PageLoader
│  │     └─ index.ts               Barrel — import from "@/components/ui"
│  │
│  ├─ lib/
│  │  ├─ api.ts                    Client API wrapper — ALL HTTP from the browser
│  │  ├─ env.ts                    Env config + fail-fast validation
│  │  ├─ phone.ts                  UK phone → E.164 (+44…) normalization
│  │  └─ server/
│  │     └─ bff.ts                 SERVER-ONLY helpers used by the BFF routes
│  │                               (cookie set/clear, proxying, timeouts)
│  │
│  └─ proxy.ts                     Route guard (Next 16 “middleware”) — §4
│
├─ public/                         Static assets
├─ .env.local                      Your local env (gitignored) — real values
├─ .env.example                    Template — copy to .env.local
├─ next.config.ts                  Next.js config
├─ tsconfig.json                   TS config (strict; @/* → src/*)
├─ eslint.config.mjs               ESLint (flat config)
├─ postcss.config.mjs              Tailwind/PostCSS
├─ AGENTS.md                       ⚠ Next 16 warning (read before coding)
└─ ARCHITECTURE.md                 ← you are here
```

---

## 3. “I want to change X” → go here

| I want to… | Edit |
|---|---|
| Change the API base URL / env vars | `.env.local` (values), `src/lib/env.ts` (how they’re read/validated) |
| Add or change an **API call** the browser makes | `src/lib/api.ts` (`unifiedAuth` / `adminAuth` / `riderAuth` / `driverAuth` / `api`) |
| Add a new **authenticated** endpoint | New route under `src/app/api/bff/**` **and** a method in `src/lib/api.ts` (see §5) |
| Change how the **JWT cookie** is set / its lifetime / flags | `src/lib/server/bff.ts` (`cookieOptions`, `jsonWithToken`) |
| Change which routes require login | `src/proxy.ts` (the `matcher` + the checks) |
| Change error/timeout/connection messages shown to users | `src/lib/api.ts` (client) and `src/lib/server/bff.ts` (`upstreamError`) |
| Edit the **admin** sidebar/shell or sign-out | `src/app/admin/layout.tsx` |
| Edit the admin dashboard content | `src/app/admin/page.tsx` |
| Edit **the sign-in page** (all roles) | `src/app/auth/login/page.tsx` |
| Change how a role is detected from credentials | `Mapcars.Application/Auth/Services/UnifiedAuthService.cs` (API side) |
| Edit rider **signup / OTP / profile** screens | `src/app/auth/<page>/page.tsx` |
| Change phone-number handling (e.g. non-UK) | `src/lib/phone.ts` |
| Change the home page / API status indicator | `src/app/page.tsx` |
| Change fonts, `<title>`, global `<html>` | `src/app/layout.tsx` |
| Change the global error screen or 404 | `src/app/error.tsx` / `src/app/not-found.tsx` |
| Change global styles / theme tokens | `src/app/globals.css` (see §6 before editing) |
| Restyle a **signed-in** screen (admin/driver/account) | Use `@/components/ui` — don't hand-roll cards or sidebars (§6) |
| Change a portal's sidebar links | Driver/rider: the `NAV` array in that portal's `layout.tsx`. Admin: it's API-driven — edit the `menus` rows in the DB |
| Change a response/request type shape | `src/lib/api.ts` (the `*Response` / `*Session` interfaces) — keep in sync with the API |

---

## 4. How auth works (the important part)

We use the **Backend-for-Frontend (BFF)** pattern so the session token is never
exposed to JavaScript.

There is **one sign-in page** (`/auth/login`) for all three roles — it doesn't
ask which kind of account you have. It posts to the API's role-detecting
`POST /api/v1/auth/login`, which tries the email against Admin, then Rider,
then Driver and returns whichever one the password matches (`userType` in the
response says which). The BFF route picks the cookie to set from that
`userType` at request time — it isn't known upfront the way the three
underlying per-role API endpoints (`/api/v1/admin/auth/login`,
`/api/v1/auth/riders/login`, `/api/v1/auth/drivers/login`) are still used
directly by the mobile apps.

```
Browser                     Our Next server                        .NET API
───────                     ───────────────                        ────────
login form ──fetch──▶ /api/bff/auth/login ──bearer/JSON──▶ /api/v1/auth/login
                              │  gets { token, userType, ... }
                              │  picks mc_admin / mc_rider / mc_driver from userType
                              │  Set-Cookie: <that cookie>=<JWT>  (httpOnly, Secure, SameSite)
                              │  returns body WITHOUT the token
   ◀──────────────────────────┘
redirect by userType: admin→/admin, driver→/driver, rider→/account|/auth/profile
   │ proxy.ts sees the matching cookie present → allows
   ▼
{admin,driver}/layout.tsx ──fetch──▶ /api/bff/{admin,driver}/me ──bearer──▶ /…/me
```

**Pieces:**
- **`src/app/api/bff/**/route.ts`** — thin handlers; each just delegates to a
  helper in `bff.ts` with the upstream API path + which cookie to use.
- **`src/lib/server/bff.ts`** — the engine:
  - `proxyLogin` — forwards a login to a *known* cookie; on success stores the
    JWT in the cookie and **strips it** from the response. Still used by
    `admin/setup` and the rider Google/OTP-verify routes (those already know
    their role).
  - `proxyRoleLogin` — same idea, but for `/auth/login`: the cookie isn't
    picked until the response comes back and its `userType` is read.
  - `proxyAuthed` — reads the cookie, attaches it as `Authorization: Bearer …`;
    refreshes the cookie if a new token comes back; **clears it on 401**.
  - `proxyPublic` — forwards as-is (no cookie), e.g. `send-otp`, `signup`.
  - `proxyLogout` — clears the cookie.
- **`src/proxy.ts`** — server-side **optimistic** guard. It only checks the
  cookie is *present* (fast, no API call) to pre-filter unauthenticated users and
  avoid flashing protected UI. Real authorization happens at the API; the BFF
  clears the cookie on a 401. Currently guards `/admin/*` (except `/admin/login`),
  `/driver/*` (except `/auth/driver/login`), `/auth/profile`, and `/account`.
  Every guard redirects unauthenticated users to `/auth/login`; `/admin/login`
  and `/auth/driver/login` are kept only as thin redirect stubs for old
  bookmarks/links, not as guard exemptions anyone should navigate to directly.

**Cookies:** `mc_admin` (admin), `mc_rider` (rider), `mc_driver` (driver).
`httpOnly` always; `Secure` in production; `SameSite=lax`; `maxAge` derived
from the API's `expiresInMinutes`.

---

## 5. Recipe: add a new authenticated endpoint

Say the API adds `GET /api/v1/riders/trips`.

1. **Create the BFF route** — `src/app/api/bff/rider/trips/route.ts`:
   ```ts
   import type { NextRequest } from "next/server";
   import { proxyAuthed, RIDER_COOKIE } from "@/lib/server/bff";

   export async function GET(req: NextRequest) {
     return proxyAuthed(req, "/api/v1/riders/trips", "GET", RIDER_COOKIE);
   }
   ```
2. **Add a client method + type** in `src/lib/api.ts`:
   ```ts
   export interface TripSummary { id: string; status: string; /* … */ }

   export const riderTrips = {
     list: () => bff<TripSummary[]>("GET", "/rider/trips"),
   };
   ```
3. **Call it** from a page/component: `const trips = await riderTrips.list();`.
4. If the page must be login-gated, make sure its path is covered by the
   `matcher` in `src/proxy.ts`.

> Public (no login) endpoint? Use `proxyPublic` in the route and call it the same
> way from `api.ts`.

---

## 6. Environment variables

Defined/validated in `src/lib/env.ts`; template in `.env.example`.

| Var | Exposed to browser? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | yes | `local` \| `staging` \| `prod` — drives UI badges & dev-only affordances |
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the .NET API. **Required in a production build** (build throws if missing) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | yes | Mapbox public token for maps |
| `API_INTERNAL_URL` | **no (server-only)** | Optional internal URL the BFF uses to reach the API (e.g. private VPC address). Falls back to `NEXT_PUBLIC_API_URL` |

Rules: anything starting with `NEXT_PUBLIC_` is bundled into the browser — **never
put secrets there**. `isDev` (dev-only UI like showing OTP codes) is *only* true
when `APP_ENV=local` **and** it’s not a production build.

> **In production these are not runtime config.** `NEXT_PUBLIC_*` values are
> string-substituted into the bundle by `next build`, so in the Docker image they are
> **build args**, not `docker run -e` flags — changing one needs a rebuild. Only
> `API_INTERNAL_URL` is read at runtime. See `../DEPLOYMENT_WEB.md`.

---

## 7. Commands

```bash
npm run dev      # local dev server → http://localhost:3000
npm run build    # production build (also type-checks; fails on missing prod env)
npm run start    # serve the production build
npm run lint     # ESLint
npx tsc --noEmit # type-check only
```

Start the .NET API first (`../api`) — the home page shows a live connection
indicator.

---

## 6b. The signed-in UI kit (`src/components/ui`)

The three portals — admin, driver, account — share one component kit so they
look like one product. **Build signed-in screens from these; don't hand-roll a
card, sidebar or stat tile.**

```tsx
import { Page, PageHeader, StatCard, StatGrid, Card, Badge, ErrorBanner } from "@/components/ui";
```

- **`AppShell`** owns the sidebar, brand mark, active state and the mobile
  drawer. Each portal's `layout.tsx` is just config: a `tone`
  (`admin` | `driver` | `rider`), a `nav` tree, the signed-in `user`, and
  `onSignOut`. The admin portal maps the API's menu tree straight into `nav`.
- **`Icon`** is an inline SVG map keyed by the lucide-style names the API
  already stores on each menu row, so API-driven nav gets icons for free.
  Unknown names fall back to a neutral dot. Add new glyphs to `Icon.tsx` — the
  project intentionally ships **no icon dependency**.
- **Brand mark.** `Logo.tsx` holds the MapCars two-swoosh mark (traced from
  `public/assets/images/mapcars_logo1.png`, wordmark dropped — it's illegible
  below ~64px). `src/app/icon.svg` is the browser-tab favicon and **inlines the
  same two paths**; if the mark is ever redrawn, update both. Next picks up
  `icon.svg` by file convention — there is deliberately no `favicon.ico` (the
  scaffold's default one was removed so nothing can out-rank the real icon).
- **`StatCard`'s `hint`** is for real context the API gives us ("Needs review",
  "12 ratings", "Live now"). Never put invented trend data there — the UI owns
  no business data.
- Every remote call should render all three states: `Skeleton` while loading,
  `ErrorBanner` (with `onRetry`) on failure, `EmptyState` when there's nothing.

### Design tokens — read this before editing `globals.css`

Colours are declared as **literal values inside `@theme`**. Do *not* refactor
them into `@theme inline { --color-x: var(--x) }` pointing at a plain `:root`:
that indirection silently generates **no** utility at all (classes like
`border-line` fall back to inherited black) and the unreferenced `:root` var
gets pruned. This was a real bug — it left the whole kit visually inert.

Brand cyan is only ~2.3:1 on white, so it is a **fill**, not a text colour:

| Use | Token |
|---|---|
| Rails, icon chips, gradients, large marks | `brand`, `accent` |
| Any text or icon that must be read | `brand-ink`, `accent-ink` |
| Tinted backgrounds behind those | `brand-tint`, `accent-tint` |
| Body / labels / smallest hints | `ink`, `ink-muted`, `ink-faint` |
| Page background vs card | `app-bg` vs `surface`, hairlines `line` |

`landing.css`, `site.css` and `auth.css` predate this and consume raw
`var(--brand)`-style names from `:root`; those aliases are kept deliberately.
`auth.css` scopes its own `--ink`/`--line` to `.auth-wrap`, which is why the
Tailwind tokens are named `--color-ink`/`--color-line` — don't reintroduce
bare `--ink`/`--line` at `:root` or they'll collide.

---

## 8. Conventions & gotchas

- **Client vs server components:** files with `"use client"` run in the browser
  (state, effects, event handlers). BFF `route.ts` files and `proxy.ts` run on
  the server only — never import `src/lib/server/bff.ts` into a client component.
- **Imports:** use the `@/` alias (`@/lib/api`) → maps to `src/`.
- **Errors:** API/BFF calls throw `ApiError` (has `.status`). Catch with
  `err instanceof ApiError ? err.message : "fallback"`.
- **Next 16 specifics:** route guards live in `src/proxy.ts` (not
  `middleware.ts`); `cookies()` from `next/headers` is async; route handlers use
  the Web `Request`/`Response` (and `NextRequest`/`NextResponse`) APIs.
- **Don’t hand-edit response types to diverge from the API.** If the contract
  changes, update `api.ts` to match (or regenerate from OpenAPI).
