# Mapcars web (Next.js 16) — production image.
#
# Mirrors the shape of ../api/Dockerfile: a fat build stage, then a slim runtime
# stage that carries only the published output. The resulting image is the
# portable artifact — it runs unchanged on the GCE VM today and on ECS Fargate
# after the AWS migration.
#
# Build (all five NEXT_PUBLIC_* values are required — see the ARG note below):
#   docker build -t mapcars-web:local \
#     --build-arg NEXT_PUBLIC_API_URL=https://gce-test.mapcars.uk \
#     --build-arg NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx \
#     --build-arg NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaxxx \
#     --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com .

# ---- Dependencies stage ----
FROM node:22-alpine AS deps
# libc6-compat: sharp (pulled in by next/image) links against glibc symbols on musl.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only the manifests first so this layer caches until dependencies change.
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build stage ----
FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are INLINED INTO THE BROWSER BUNDLE at build time — they are
# not read from the environment at runtime. They must therefore be build args, and
# changing any of them requires a rebuild, not just a container restart.
#
# There is deliberately no default for NEXT_PUBLIC_API_URL: `next build` runs with
# NODE_ENV=production, and src/lib/env.ts throws on a missing value in a production
# build. So a forgotten build arg fails the build loudly instead of shipping an
# image that silently points at localhost.
#
# BuildKit emits `SecretsUsedInArgOrEnv` warnings for the two token args below.
# They are expected, not a bug to fix: every NEXT_PUBLIC_* value is served to every
# browser visitor by design, and Next can only inline them at build time. Do not
# convert these to runtime env vars — that silently produces a bundle with empty
# values. Genuine secrets never appear here.
ARG NEXT_PUBLIC_APP_ENV=prod
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_GOOGLE_MAPS_KEY
# The OAuth **Web** client ID behind "Continue with Google". Public by design (it
# ships in the bundle), but it must match one of the audiences in the API's
# `Google:ClientId` or the API rejects every ID token the button produces.
# Omitted → the button renders and reports that Google sign-in isn't configured.
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN \
    NEXT_PUBLIC_GOOGLE_MAPS_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_KEY \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a non-root user — nothing in the app needs write access to the image.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# `output: "standalone"` bundles the server plus only its traced node_modules,
# but does NOT copy public/ or .next/static — those are copied in explicitly,
# after which standalone's server.js serves them itself (no CDN in front of us).
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Server-only config (API_INTERNAL_URL) is injected at `docker run` time — it is
# read at runtime by src/lib/server/bff.ts, so it must NOT be baked in here.
CMD ["node", "server.js"]
