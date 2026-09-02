#!/bin/bash
# build-prod.sh — Manually compile API + website + admin-portal + dashboard in order.
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
# Builds run serially so the frontends do not compete for build memory. The
# dashboard's production build is included now that its split page modules fit
# reliably within the runner's available memory.

set -euo pipefail

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        BDE Farm Trac — Manual Production Build           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Builds: lib/db → API server → website → admin portal → dashboard"
echo ""

# ── Step 1: lib/db ────────────────────────────────────────────────────────────
echo "▶ [1/5] Rebuilding lib/db compiled declarations …"
cd lib/db && npx tsc --build tsconfig.json
cd ../..
echo "  ✓ lib/db done"
echo ""

# ── Step 2: API server ────────────────────────────────────────────────────────
echo "▶ [2/5] Building API server …"
pnpm --filter @workspace/api-server run build
echo "  ✓ API server done → artifacts/api-server/dist/index.cjs"
echo ""

# ── Step 3: Website ───────────────────────────────────────────────────────────
echo "▶ [3/5] Building website …"
NODE_ENV=production PORT=19161 BASE_PATH=/ \
  pnpm --filter @workspace/website run build
echo "  ✓ Website done → artifacts/website/dist/public"
echo ""

# ── Step 4: Admin portal ──────────────────────────────────────────────────────
echo "▶ [4/5] Building admin portal …"
NODE_ENV=production PORT=25580 BASE_PATH=/admin-portal/ \
  pnpm --filter @workspace/admin-portal run build
echo "  ✓ Admin portal done → artifacts/admin-portal/dist/public"
echo ""

# ── Step 5: Dashboard ─────────────────────────────────────────────────────────
echo "▶ [5/5] Building dashboard …"
NODE_ENV=production PORT=23183 BASE_PATH=/dashboard/ \
  pnpm --filter @workspace/dashboard run build
echo "  ✓ Dashboard done → artifacts/dashboard/dist/public"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  Manual build complete."
echo "══════════════════════════════════════════════════════════════"
echo ""
