# Mapcars Web — Run & Test Instructions

Next.js (App Router, TypeScript, Tailwind) customer web app + (later) admin
portal. Talks **only** to the Mapcars .NET API — no direct database access.

## Prerequisites (software)

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20+ (22 installed) | `node --version` |
| npm | 10+ | `npm --version` |

## Accounts / API keys you will need

| Service | What for | Env var | Free to start? |
|---------|----------|---------|----------------|
| **Mapbox** | Map rendering in the browser | `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes — free tier |
| **Google OAuth** | "Continue with Google" on sign-in/sign-up | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes — free |
| (the API) | All app data | `NEXT_PUBLIC_API_URL` | Local, free |

> `NEXT_PUBLIC_*` values ship to the browser. Only use the Mapbox **public**
> token (`pk....`) here — never a secret key. Server secrets (Stripe etc.) live
> in the API, not in the web app.

### How to get the Mapbox token
mapbox.com → Account → *Access tokens* → copy the default public token.

### How to get the Google client ID ("Continue with Google")

The button is already on `/auth/login` and `/auth/signup` and is fully wired
(Google Identity Services → ID token → `/api/bff/rider/google` →
`POST /api/v1/auth/riders/google`). It is **not functional yet**: with no client
ID, clicking it says "Google sign-in isn't set up yet" rather than failing
silently.

1. Google Cloud console (project `mapcars-2b5a8`) → *APIs & Services →
   Credentials* → create an **OAuth client ID → Web application**.
2. Authorised JavaScript origins: `http://localhost:3005` and
   `https://mapcars.uk`.
3. Put the ID in `.env.local` → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and mirror the
   file into `keys/web/.env.local`.
4. Add the **same** ID to the API's `Google:ClientId` (on the VM: the
   `Google__ClientId` env var in `~/mapcars-api.env`) — the API rejects the
   token otherwise. Until it is set the API skips the audience check entirely,
   so don't enable Google sign-in in production before doing this.

`NEXT_PUBLIC_*` is baked in at build time, so on the deployed site this is a
Docker **build arg**, not a runtime env var — changing it needs a rebuild.

## Setup

```powershell
cd web
copy .env.example .env.local   # then edit .env.local with your Mapbox token
npm install                    # already done during scaffold
```

## Run it

```powershell
cd web
npm run dev
```

Open http://localhost:3000 — the home page shows a live **API connection**
indicator (green = API reachable). Start the API first (see `../api/instruction.md`).

## Test the full wiring

1. Terminal 1: `cd api/src/Mapcars.Api && dotnet run`
2. Terminal 2: `cd web && npm run dev`
3. Visit http://localhost:3000 → status dot should be **green** and show the
   `/api/v1/ping` response.
