#!/usr/bin/env bash
# Build + switch the app container to Next.js production mode.
# Use before showing the site to others or to verify SSR/build correctness.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"

# 1. Run the production build inside the container (uses its node_modules).
echo "→ next build (this takes ~15-30s)"
docker exec fxn-chisfis-frontend npx next build

# 2. Idempotent: rewrite the `command:` line in docker-compose.yml to start.
sed -i 's|command: sh -c "npm run dev.*"|command: sh -c "npm run start -- -p 3010 -H 0.0.0.0"|' docker-compose.yml

# 3. Bring the stack down + up so the new command takes effect and we serve the build.
docker compose down
docker compose up -d

# 4. Quick sanity check.
sleep 4
echo
echo "→ Smoke tests"
for path in "/" "/flights"; do
  printf "  %-10s %s\n" "$path" "$(curl -sS -o /dev/null -w 'HTTP %{http_code} (%{time_total}s)' "https://travel.originfacts.com$path")"
done
echo
echo "✓ Prod mode active. Pages served from .next/ (no HMR, gzipped bundles)."
echo "  Re-build after code changes:  ./prod.sh"
echo "  Switch back to dev:           ./dev.sh"
