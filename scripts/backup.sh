#!/usr/bin/env bash
# Daily host cron: backups of Postgres + media volume (docs/12).
# Example crontab: 15 3 * * * /opt/delepe-menu/scripts/backup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
cd "$ROOT"

docker compose exec -T db sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' >"$BACKUP_DIR/db-${STAMP}.dump"
docker run --rm \
  -v delepe_storage:/data:ro \
  -v "$BACKUP_DIR":/backups \
  alpine:3.20 \
  tar czf "/backups/storage-${STAMP}.tgz" -C /data .

find "$BACKUP_DIR" -type f \( -name 'db-*.dump' -o -name 'storage-*.tgz' \) -mtime "+${RETENTION_DAYS}" -delete

echo "Wrote $BACKUP_DIR/db-${STAMP}.dump and storage-${STAMP}.tgz"
