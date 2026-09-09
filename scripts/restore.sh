#!/usr/bin/env bash
# Restore a pg_dump -Fc file and a storage tarball into a running compose stack (docs/12).
# Usage: scripts/restore.sh /backups/db-YYYYMMDD.dump /backups/storage-YYYYMMDD.tgz
set -euo pipefail

if [ "${1:-}" = "" ] || [ "${2:-}" = "" ]; then
  echo "Usage: $0 <db.dump> <storage.tgz>" >&2
  exit 1
fi

DUMP="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
TAR="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker compose stop app
docker compose exec -T db dropdb -U delepe --if-exists delepe
docker compose exec -T db createdb -U delepe delepe
docker compose exec -T db pg_restore -U delepe -d delepe --no-owner <"$DUMP"

docker run --rm \
  -v delepe_storage:/data \
  -v "$TAR":/backup.tgz:ro \
  alpine:3.20 \
  sh -c "rm -rf /data/* /data/.[!.]* 2>/dev/null; tar xzf /backup.tgz -C /data"

docker compose start app
echo "Restore finished. Check /api/health."
