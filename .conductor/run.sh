#!/usr/bin/env bash

set -euo pipefail

# Change to workspace root (one level up from .conductor).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Require .env written by setup.sh; no fallback.
if [ ! -f .env ]; then
  echo "❗  .env not found. Run .conductor/setup.sh first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a
echo "✅  Loaded .env variables"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❗  DATABASE_URL missing from .env. Run .conductor/setup.sh." >&2
  exit 1
fi

echo "Using DATABASE_URL=${DATABASE_URL}"

npm run dev
