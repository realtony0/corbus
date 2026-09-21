#!/usr/bin/env bash
# One-shot Cloudflare setup: creates the R2 bucket, uploads every secret the
# worker needs, and deploys.
#
# Usage:
#   cp .env.example .env.local   # fill it in
#   export CLOUDFLARE_API_TOKEN=...      # or run `npx wrangler login` first
#   bash scripts/setup-cloudflare.sh
#
# Safe to re-run: the bucket creation tolerates an existing bucket and secrets
# are overwritten in place.

set -euo pipefail
cd "$(dirname "$0")/.."

BUCKET=corbus-media

if [ -f .env.local ]; then
  echo "→ Loading .env.local"
  set -a; . ./.env.local; set +a
fi

missing=0
for var in SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY NEXT_PUBLIC_R2_PUBLIC_URL ADMIN_PASSWORD ADMIN_SESSION_SECRET; do
  if [ -z "${!var:-}" ]; then
    echo "✗ $var is not set (put it in .env.local)"
    missing=1
  fi
done
[ "$missing" -eq 0 ] || exit 1

echo "→ Creating R2 bucket $BUCKET (ignored if it already exists)"
npx wrangler r2 bucket create "$BUCKET" 2>&1 | sed 's/^/  /' || true

echo "→ Uploading secrets to the worker"
for var in SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY ADMIN_PASSWORD ADMIN_SESSION_SECRET; do
  printf '%s' "${!var}" | npx wrangler secret put "$var" >/dev/null
  echo "  ✓ $var"
done

echo "→ Building and deploying"
npm run deploy

cat <<'DONE'

✓ Done. Remaining manual step, once only:
  Cloudflare dashboard → R2 → corbus-media → Settings → enable public access
  (r2.dev URL or a custom domain), and make sure that URL matches
  NEXT_PUBLIC_R2_PUBLIC_URL.
DONE
