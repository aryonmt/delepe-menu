#!/bin/sh
set -eu
mkdir -p "${STORAGE_ROOT:-/data/storage}"
cd /app
./node_modules/.bin/prisma migrate deploy
exec node server.js
