#!/bin/bash
set -e

# Install/sync dependencies
pnpm install --frozen-lockfile

# Rebuild lib/db compiled declarations (needed when schema changes)
cd lib/db && npx tsc --build tsconfig.json
cd ../..

# Keep the dashboard's committed dist as a safety net after merges. Production
# builds (Publish or scripts/build-prod.sh) build it fresh; post-merge stays
# restore-only so a constrained merge hook can never take down the runner.
git checkout HEAD -- artifacts/dashboard/dist/ || true
