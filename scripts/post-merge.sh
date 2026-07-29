#!/bin/bash
set -e

# Install/sync dependencies
pnpm install --frozen-lockfile

# Rebuild lib/db compiled declarations (needed when schema changes)
cd lib/db && npx tsc --build tsconfig.json
cd ../..

# Rebuild the dashboard static bundle (it serves from dist/)
# NODE_OPTIONS needed — Vite chunk rendering is memory-intensive on this large bundle
NODE_OPTIONS=--max-old-space-size=4096 PORT=3000 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build
