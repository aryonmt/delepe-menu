#!/usr/bin/env bash
# Live VPS update for the restaurant menu.
# Rebuilds the app image without touching the Postgres data volume.
# Never: compose down with volumes, volume rm, migrate reset, force-recreate db.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

log() {
  printf '%s\n' "$*"
}

require_compose() {
  if [[ ! -f docker-compose.yml ]]; then
    log "docker-compose.yml not found in ${ROOT}"
    exit 1
  fi
}

ensure_db() {
  local i
  log "Ensuring Postgres is up (existing data volume is reused, never recreated)."
  docker compose up -d db
  for i in $(seq 1 30); do
    if docker compose exec -T db pg_isready -U delepe -d delepe >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  log "Postgres did not become ready. Aborting before stopping the menu."
  exit 1
}

stop_frontend() {
  log "Stopping app and caddy only (short menu downtime; database stays up)."
  docker compose stop app caddy
}

build_app() {
  log "Building app image..."
  if docker compose build app; then
    return 0
  fi
  log "Build failed; starting the previous app image. Database was not touched."
  docker compose up -d app caddy
  exit 1
}

start_frontend() {
  log "Starting app and caddy..."
  docker compose up -d app caddy
}

wait_healthy() {
  local i
  for i in $(seq 1 45); do
    if docker compose exec -T app node -e \
      "fetch('http://127.0.0.1:3000/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" \
      >/dev/null 2>&1; then
      log "Health check ok."
      return 0
    fi
    sleep 2
  done
  log "App did not become healthy. Postgres was not modified."
  log "Inspect with: docker compose logs app --tail=80"
  exit 1
}

prune_dangling() {
  log "Removing dangling images only (volumes are never pruned)."
  docker image prune -f
}

require_compose
ensure_db
stop_frontend
build_app
start_frontend
wait_healthy
prune_dangling
log "Update complete. Database volume was not touched."
