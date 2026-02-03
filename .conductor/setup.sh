#!/usr/bin/env bash

set -euo pipefail

# Ensure required commands are available.
command -v psql >/dev/null 2>&1 || {
  echo "❗  psql is required but not found in PATH" >&2
  exit 1
}
echo "✅  psql found"

command -v npm >/dev/null 2>&1 || {
  echo "❗  npm is required but not found in PATH" >&2
  exit 1
}
echo "✅  npm found"


# Change to workspace root (one level up from .conductor).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_NAME="$(basename "$ROOT_DIR")"
WORKSPACE_DB_SUFFIX="${WORKSPACE_NAME//[^[:alnum:]_]/_}"
cd "$ROOT_DIR"

# Ensure required app secrets are present (fallback to provided defaults).
cp $CONDUCTOR_ROOT_PATH/.env .env
# Load env vars if present (e.g., DATABASE_URL defaults).
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi
echo "✅  Loaded .env variables"

# Set workspace-specific DATABASE_URL.
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-postgres} # for psql commands
PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
DB_NAME="betpirate_${WORKSPACE_DB_SUFFIX}"
DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${DB_NAME}"
ADMIN_URL="${DATABASE_URL%/*}/postgres"
echo "DATABASE_URL set to ${DATABASE_URL}"

# export PGPASSWORD
# export DATABASE_URL

# Persist DATABASE_URL into .env so run.sh can reuse it without recomputing.
if grep -q '^DATABASE_URL=' .env; then
  sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" .env
else
  printf '\nDATABASE_URL=%s\n' "${DATABASE_URL}" >> .env
fi
echo "✅  Persisted DATABASE_URL into .env"



echo "Ensuring database ${DB_NAME} exists..."
if ! psql "$ADMIN_URL" -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  psql "$ADMIN_URL" -c "CREATE DATABASE \"${DB_NAME}\";"
  echo "✅  Database ${DB_NAME} created."
else
  echo "✅  Database ${DB_NAME} already exists."
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

echo "🎉  All set. Start the app with .conductor/run.sh"
