#!/bin/bash
# qiyom — serverni birinchi marta tayyorlash (native, zero-downtime).
# /var/www/qiyom deploy ROOT tuzilmasini (releases/ shared/ + deploy.sh/rollback.sh) yaratadi.
# Repo working-copy'dan ishga tushiring:  bash <repo>/server/setup.sh
# Idempotent — qayta ishga tushirsa bo'ladi.
set -euo pipefail

APP_DIR="/var/www/qiyom"
DEPLOY_USER="${DEPLOY_USER:-$(id -un)}"   # DEPLOY_USER=deploy bilan bekor qilish mumkin
DEPLOY_GROUP="${DEPLOY_GROUP:-www-data}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> qiyom setup: $APP_DIR (egasi: $DEPLOY_USER:$DEPLOY_GROUP)"

sudo mkdir -p "$APP_DIR"/{releases,shared}
sudo mkdir -p "$APP_DIR"/shared/storage/{app/public,framework/{cache,sessions,views},logs}

# --- deploy skriptlari (standalone, root'da) ---
sudo cp "$SCRIPT_DIR/deploy.sh"   "$APP_DIR/deploy.sh"
sudo cp "$SCRIPT_DIR/rollback.sh" "$APP_DIR/rollback.sh"
sudo chmod +x "$APP_DIR/deploy.sh" "$APP_DIR/rollback.sh"

# --- shared/.env (Laravel backend) ---
SHARED_ENV="$APP_DIR/shared/.env"
if [[ ! -f "$SHARED_ENV" ]]; then
  sudo cp "$REPO_ROOT/api/.env.example" "$SHARED_ENV"
  echo "==> $SHARED_ENV yaratildi — QO'LDA to'ldiring:"
  echo "    APP_ENV=production, APP_DEBUG=false, APP_KEY=..., APP_URL=https://qiyomapi.pcbuild.uz"
  echo "    DB_DATABASE=elektr, DB_USERNAME=postgres, DB_PASSWORD=..."
else
  echo "==> $SHARED_ENV mavjud — tegilmadi."
fi

# --- shared/.env.frontend (Vite build-time) ---
SHARED_FE="$APP_DIR/shared/.env.frontend"
if [[ ! -f "$SHARED_FE" ]]; then
  echo "VITE_API_URL=https://qiyomapi.pcbuild.uz" | sudo tee "$SHARED_FE" >/dev/null
  echo "==> $SHARED_FE yaratildi (VITE_API_URL)."
else
  echo "==> $SHARED_FE mavjud — tegilmadi."
fi

# --- egalik + huquqlar (php-fpm www-data storage'ga yoza olishi uchun) ---
sudo chown -R "$DEPLOY_USER:$DEPLOY_GROUP" "$APP_DIR"
sudo chmod -R g+rwX "$APP_DIR/shared/storage"

echo "==> Setup tugadi."
echo "    1) $SHARED_ENV va $SHARED_FE ni to'ldiring"
echo "    2) bash $APP_DIR/deploy.sh"
