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
| (the API) | All app data | `NEXT_PUBLIC_API_URL` | Local, free |

> `NEXT_PUBLIC_*` values ship to the browser. Only use the Mapbox **public**
> token (`pk....`) here — never a secret key. Server secrets (Stripe etc.) live
> in the API, not in the web app.

### How to get the Mapbox token
mapbox.com → Account → *Access tokens* → copy the default public token.

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
