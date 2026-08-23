#!/bin/bash
# build-prod.sh — Manually compile API + website + admin-portal in the correct order.
#
# --- PUBLISH LIFECYCLE (automatic) ---
# You do NOT need to run this before every Publish. Replit's Publish button
# triggers each artifact's production build command automatically via
# artifact.toml [services.production] build:
#
#   API server:   lib/db rebuild → pnpm --filter @workspace/api-server run build
#   Website:      PORT=19161 BASE_PATH=/ pnpm --filter @workspace/website run build
#   Admin portal: PORT=25580 BASE_PATH=/admin-portal/ pnpm --filter @workspace/admin-portal run build
#   Dashboard:    PORT=23183 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build
#
# These run in parallel during Publish, with lib/db rebuilt as the first step
# of the API server's build command so declarations are always up-to-date.
#
# --- WHEN TO USE THIS SCRIPT ---
# Run this script when you want to verify a local production build passes
# before publishing, or to rebuild specific artifacts after a manual schema
# or source change without triggering a full Publish cycle:
#
#   bash scripts/build-prod.sh
#
# Note: the dashboard build requires ~3 GB of free RAM. If all dev-server
# workflows are running the build may OOM. Stop competing workflows first, or
# use the recipe in .agents/memory/dashboard-build-oom.md. The dashboard is
# therefore excluded from this script; use its artifact.toml build command
# directly or Publish to build it in the production environment where dev
# servers are not competing for memory.

set -euo pipefail

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        BDE Farm Trac — Manual Production Build           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Builds: lib/db → API server → website → admin portal"
echo "  (Dashboard excluded; see comment at top of this file)"
echo ""

# ── Step 1: lib/db ────────────────────────────────────────────────────────────
echo "▶ [1/4] Rebuilding lib/db compiled declarations …"
cd lib/db && npx tsc --build tsconfig.json
cd ../..
echo "  ✓ lib/db done"
echo ""

# ── Step 2: API server ────────────────────────────────────────────────────────
echo "▶ [2/4] Building API server …"
pnpm --filter @workspace/api-server run build
echo "  ✓ API server done → artifacts/api-server/dist/index.cjs"
echo ""

# ── Step 3: Website ───────────────────────────────────────────────────────────
echo "▶ [3/4] Building website …"
NODE_ENV=production PORT=19161 BASE_PATH=/ \
  pnpm --filter @workspace/website run build
echo "  ✓ Website done → artifacts/website/dist/public"
echo ""

# ── Step 4: Admin portal ──────────────────────────────────────────────────────
echo "▶ [4/4] Building admin portal …"
NODE_ENV=production PORT=25580 BASE_PATH=/admin-portal/ \
  pnpm --filter @workspace/admin-portal run build
echo "  ✓ Admin portal done → artifacts/admin-portal/dist/public"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  Manual build complete."
echo "══════════════════════════════════════════════════════════════"
echo ""
