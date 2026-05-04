#!/usr/bin/env bash
# Switch the app container to Next.js dev mode (Turbopack, HMR, no build needed).
# Use during active development.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"

# Idempotent: rewrite the `command:` line in docker-compose.yml to dev.
sed -i 's|command: sh -c "npm run start.*"|command: sh -c "npm run dev -- -p 3010 -H 0.0.0.0"|' docker-compose.yml

# Bring the stack down + up so the new command takes effect.
docker compose down
docker compose up -d

echo
echo "✓ Dev mode active. Hot-reload on every edit under frontend/src."
echo "  Logs:     docker compose logs -f app"
echo "  Restart:  docker compose restart app"
