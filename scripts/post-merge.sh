#!/bin/bash
set -e

# Install/sync dependencies
pnpm install --frozen-lockfile

# Rebuild lib/db compiled declarations (needed when schema changes)
cd lib/db && npx tsc --build tsconfig.json
cd ../..

# Restore the dashboard's committed dist so it stays functional.
# We do NOT attempt a production build here — the build needs ~5 GB of RAM
# but only ~1 GB is available while all other services are running, causing
# the OOM killer to terminate the entire runner process before any fallback
# can execute.  The dashboard serves the last committed dist (slightly stale
# after source-only task merges) until someone manually triggers a rebuild
# by restarting the dashboard workflow on a container with more free memory.
git checkout HEAD -- artifacts/dashboard/dist/ || true
