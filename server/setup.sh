#!/usr/bin/env bash
# qiyom — serverni birinchi marta tayyorlash.
# Release/shared tuzilmasini yaratadi va shared/.env ni tayyorlaydi.
# Idempotent: qayta-qayta ishga tushirsa bo'ladi.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF="${SCRIPT_DIR}/deploy.conf"

if [[ ! -f "$CONF" ]]; then
  echo "XATO: ${CONF} topilmadi. deploy.conf.example dan nusxa oling." >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$CONF"

echo "==> qiyom setup: ${SERVER_PATH}"

sudo mkdir -p "${SERVER_PATH}"/{releases,shared,shared/storage}
sudo chown -R "$(id -u):$(id -g)" "${SERVER_PATH}"

# --- shared/.env (docker-compose root env) ---
SHARED_ENV="${SERVER_PATH}/shared/.env"
if [[ ! -f "$SHARED_ENV" ]]; then
  # Repo dagi .env.template dan boshlang'ich nusxa (agar mavjud bo'lsa)
  if [[ -f "${SCRIPT_DIR}/../.env.template" ]]; then
    cp "${SCRIPT_DIR}/../.env.template" "$SHARED_ENV"
  else
    cat > "$SHARED_ENV" <<'EOF'
APP_NAME=qiyom
APP_ENV=production
APP_KEY=
APP_DEBUG=false
DB_DATABASE=qiyom
DB_USERNAME=qiyom_user
DB_PASSWORD=change_me
EOF
  fi
  echo "==> ${SHARED_ENV} yaratildi — QO'LDA to'ldiring (ayniqsa APP_KEY, DB_PASSWORD)."
  echo "    APP_KEY generatsiya: docker compose run --rm api php artisan key:generate --show"
else
  echo "==> ${SHARED_ENV} allaqachon mavjud — tegilmadi."
fi

# --- persistent storage ---
mkdir -p "${SERVER_PATH}/shared/storage/app/public" \
         "${SERVER_PATH}/shared/storage/framework/"{cache,sessions,views} \
         "${SERVER_PATH}/shared/storage/logs"

echo "==> Setup tugadi. Endi: ${SCRIPT_DIR}/deploy.sh"
