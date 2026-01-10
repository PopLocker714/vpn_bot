#!/bin/sh
set -e

echo "Running migrations..."

bun run drizzle-kit generate --config ./src/db/sqliteMemory/drizzle.config.ts
bun run drizzle-kit generate --config ./src/db/sqlite/drizzle.config.ts
bun run drizzle-kit migrate --config ./src/db/sqlite/drizzle.config.ts

echo "Starting server..."
exec "$@"
