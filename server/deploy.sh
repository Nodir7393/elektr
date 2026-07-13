#!/usr/bin/env bash
# qiyom — zero-downtime deploy.
# Yangi relizni releases/<timestamp> ga tayyorlaydi, shared .env/storage ni bog'laydi,
# image'larni quradi, migratsiya qiladi, so'ng `current` symlink'ni atomik almashtiradi.
# Xatolik yoki health-check muvaffaqiyatsiz bo'lsa — avtomatik rollback.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF="${SCRIPT_DIR}/deploy.conf"
[[ -f "$CONF" ]] || { echo "XATO: ${CONF} topilmadi." >&2; exit 1; }
# shellcheck disable=SC1090
source "$CONF"

: "${COMPOSE:=docker compose}"
RELEASES_DIR="${SERVER_PATH}/releases"
SHARED_DIR="${SERVER_PATH}/shared"
CURRENT="${SERVER_PATH}/current"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"

log() { echo -e "\033[1;34m==>\033[0m $*"; }
err() { echo -e "\033[1;31mXATO:\033[0m $*" >&2; }

PREVIOUS=""
[[ -L "$CURRENT" ]] && PREVIOUS="$(readlink -f "$CURRENT")"

rollback_on_fail() {
  err "Deploy muvaffaqiyatsiz. Rollback..."
  if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
    ln -sfn "$PREVIOUS" "$CURRENT"
    ( cd "$CURRENT" && $COMPOSE up -d ) || true
    err "Oldingi relizga qaytarildi: $PREVIOUS"
  fi
  [[ -d "$RELEASE_DIR" ]] && rm -rf "$RELEASE_DIR"
  exit 1
}
trap rollback_on_fail ERR

log "Reliz: ${RELEASE_DIR}"
mkdir -p "$RELEASES_DIR"

# 1. Kodni klonlash
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$RELEASE_DIR"

# 2. Shared resurslarni bog'lash
ln -sfn "${SHARED_DIR}/.env"     "${RELEASE_DIR}/.env"          # docker-compose root env
rm -rf  "${RELEASE_DIR}/api/storage"
ln -sfn "${SHARED_DIR}/storage"  "${RELEASE_DIR}/api/storage"   # persistent laravel storage

cd "$RELEASE_DIR"

# 3. Image'larni qurish (api + pwa)
log "Image build..."
$COMPOSE build

# 4. Migratsiya (yangi image bilan, servis ko'tarilmasdan)
log "Migratsiya..."
$COMPOSE run --rm api php artisan migrate --force

# 5. Atomik almashtirish + servislarni ko'tarish
log "current -> ${RELEASE_DIR}"
ln -sfn "$RELEASE_DIR" "$CURRENT"
( cd "$CURRENT" && $COMPOSE up -d --remove-orphans )

# Laravel cache'ni yangilash
$COMPOSE exec -T api php artisan config:cache || true
$COMPOSE exec -T api php artisan route:cache  || true

# 6. Health-check
if [[ -n "${HEALTHCHECK_URL:-}" ]]; then
  log "Health-check: ${HEALTHCHECK_URL}"
  ok=0
  for i in $(seq 1 "${HEALTHCHECK_RETRIES:-10}"); do
    if curl -fsS -o /dev/null "$HEALTHCHECK_URL"; then ok=1; break; fi
    sleep "${HEALTHCHECK_DELAY:-3}"
  done
  [[ "$ok" == "1" ]] || { err "Health-check o'tmadi."; false; }
fi

# 7. Eski relizlarni tozalash
trap - ERR
log "Eski relizlarni tozalash (saqlanadi: ${KEEP_RELEASES:-5})"
ls -1dt "${RELEASES_DIR}"/*/ 2>/dev/null | tail -n +$(( ${KEEP_RELEASES:-5} + 1 )) | xargs -r rm -rf
docker image prune -f >/dev/null 2>&1 || true

log "Deploy tugadi: ${TIMESTAMP}"
