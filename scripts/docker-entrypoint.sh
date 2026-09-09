#!/bin/sh
set -eu
mkdir -p "${STORAGE_ROOT:-/data/storage}"
cd /app
./node_modules/.bin/prisma migrate deploy
# Docker sets HOSTNAME to the container id. Next standalone binds to that
# value, so 127.0.0.1 healthchecks get ECONNREFUSED. Force all interfaces.
export HOSTNAME=0.0.0.0
exec node server.js
