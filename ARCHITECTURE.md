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
│  │  │  └─ login/page.tsx         Admin login form
│  │  │
│  │  ├─ auth/                     Rider (customer) auth flow
│  │  │  ├─ login/page.tsx         Email + phone login (tabbed)
│  │  │  ├─ signup/page.tsx        Email + phone signup (tabbed)
│  │  │  ├─ verify/page.tsx        OTP code entry (phone & email)
│  │  │  └─ profile/page.tsx       Post-signup profile setup
│  │  │
│  │  └─ api/bff/                  ← BFF: our server-side auth proxy (see §4)
│  │     ├─ admin/                 login, setup, me, register, logout
│  │     └─ rider/                 send-otp, signup, login, verify-phone,
│  │                               verify-email, google, me, logout
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
| Add or change an **API call** the browser makes | `src/lib/api.ts` (`adminAuth` / `riderAuth` / `api`) |
| Add a new **authenticated** endpoint | New route under `src/app/api/bff/**` **and** a method in `src/lib/api.ts` (see §5) |
| Change how the **JWT cookie** is set / its lifetime / flags | `src/lib/server/bff.ts` (`cookieOptions`, `jsonWithToken`) |
| Change which routes require login | `src/proxy.ts` (the `matcher` + the checks) |
| Change error/timeout/connection messages shown to users | `src/lib/api.ts` (client) and `src/lib/server/bff.ts` (`upstreamError`) |
| Edit the **admin** sidebar/shell or sign-out | `src/app/admin/layout.tsx` |
| Edit the admin dashboard content | `src/app/admin/page.tsx` |
| Edit the **rider login / signup / OTP / profile** screens | `src/app/auth/<page>/page.tsx` |
| Change phone-number handling (e.g. non-UK) | `src/lib/phone.ts` |
| Change the home page / API status indicator | `src/app/page.tsx` |
| Change fonts, `<title>`, global `<html>` | `src/app/layout.tsx` |
| Change the global error screen or 404 | `src/app/error.tsx` / `src/app/not-found.tsx` |
| Change global styles / theme tokens | `src/app/globals.css` |
| Change a response/request type shape | `src/lib/api.ts` (the `*Response` / `*Session` interfaces) — keep in sync with the API |

---

## 4. How auth works (the important part)

We use the **Backend-for-Frontend (BFF)** pattern so the session token is never
exposed to JavaScript.

```
Browser                     Our Next server                   .NET API
───────                     ───────────────                   ────────
login form ──fetch──▶ /api/bff/admin/login ──bearer/JSON──▶ /api/v1/admin/auth/login
                              │  gets { token, ... }
                              │  Set-Cookie: mc_admin=<JWT>   (httpOnly, Secure, SameSite)
                              │  returns body WITHOUT the token
   ◀──────────────────────────┘
navigate to /admin
   │ proxy.ts sees mc_admin cookie present → allows
   ▼
admin/layout.tsx ──fetch──▶ /api/bff/admin/me ──reads cookie, adds bearer──▶ /…/me
```

**Pieces:**
- **`src/app/api/bff/**/route.ts`** — thin handlers; each just delegates to a
  helper in `bff.ts` with the upstream API path + which cookie to use.
- **`src/lib/server/bff.ts`** — the engine:
  - `proxyLogin` — forwards a login; on success stores the JWT in the cookie and
    **strips it** from the response.
  - `proxyAuthed` — reads the cookie, attaches it as `Authorization: Bearer …`;
    refreshes the cookie if a new token comes back; **clears it on 401**.
  - `proxyPublic` — forwards as-is (no cookie), e.g. `send-otp`, `signup`.
  - `proxyLogout` — clears the cookie.
- **`src/proxy.ts`** — server-side **optimistic** guard. It only checks the
  cookie is *present* (fast, no API call) to pre-filter unauthenticated users and
  avoid flashing protected UI. Real authorization happens at the API; the BFF
  clears the cookie on a 401. Currently guards `/admin/*` (except `/admin/login`)
  and `/auth/profile`.

**Cookies:** `mc_admin` (admin) and `mc_rider` (rider). `httpOnly` always;
`Secure` in production; `SameSite=lax`; `maxAge` derived from the API’s
`expiresInMinutes`.

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
