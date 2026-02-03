#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Load env vars if present (e.g., DATABASE_URL defaults).
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

# Ensure required app secrets are present (fallback to provided defaults).
SESSION_SECRET=${SESSION_SECRET:-xBRZyuzagsln}
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:-xxxxxxxxx}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN:-xxxxxxxxx}
DEFAULT_SHEET_ID=${DEFAULT_SHEET_ID:-cbcd608098dabc661}

export SESSION_SECRET TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN DEFAULT_SHEET_ID

echo "SESSION_SECRET=${SESSION_SECRET}"
echo "TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}"
echo "TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}"
echo "DEFAULT_SHEET_ID=${DEFAULT_SHEET_ID}"

command -v psql >/dev/null 2>&1 || {
  echo "psql is required but not found in PATH" >&2
  exit 1
}

command -v npm >/dev/null 2>&1 || {
  echo "npm is required but not found in PATH" >&2
  exit 1
}

if [ -z "${DATABASE_URL:-}" ]; then
  PGUSER=${PGUSER:-postgres}
  PGPASSWORD=${PGPASSWORD:-postgres}
  PGHOST=${PGHOST:-localhost}
  PGPORT=${PGPORT:-5432}
  DB_NAME=${DB_NAME:-"betpirate_${RANDOM}"}

  export PGPASSWORD
  DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${DB_NAME}"
  echo "DATABASE_URL not set; using ${DATABASE_URL}"
fi

# Derive DB name from DATABASE_URL, stripping query params if present.
DB_NAME_FROM_URL="${DATABASE_URL##*/}"
DB_NAME_FROM_URL="${DB_NAME_FROM_URL%%\?*}"
ADMIN_URL="${DATABASE_URL%/*}/postgres"

echo "Ensuring database ${DB_NAME_FROM_URL} exists..."
if ! psql "$ADMIN_URL" -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME_FROM_URL}'" | grep -q 1; then
  psql "$ADMIN_URL" -c "CREATE DATABASE \"${DB_NAME_FROM_URL}\";"
fi

echo "Installing Node dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "All set. Start the app with 'npm run dev' or 'npm run start'."
