#!/bin/bash
set -e

# Install/sync dependencies
pnpm install --frozen-lockfile

# Rebuild lib/db compiled declarations (needed when schema changes)
cd lib/db && npx tsc --build tsconfig.json
cd ../..

# Rebuild the dashboard static bundle (it serves from dist/)
# NODE_OPTIONS needed — Vite chunk rendering is memory-intensive on this large bundle.
# If the build is killed by OOM (exit 137), restore the last committed dist so the
# dashboard stays functional with slightly stale content rather than being broken.
echo "Building dashboard..."
if NODE_OPTIONS=--max-old-space-size=4096 PORT=3000 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build; then
  echo "Dashboard build succeeded."
else
  BUILD_EXIT=$?
  echo "Dashboard build failed (exit $BUILD_EXIT) — restoring committed dist as fallback."
  git checkout HEAD -- artifacts/dashboard/dist/ || true
fi
