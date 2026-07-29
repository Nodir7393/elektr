#!/bin/bash
# qiyom — native zero-downtime deploy (nginx + php-fpm, statik Vite build).
# releases/<timestamp> ga yangi reliz tayyorlaydi, shared .env/storage ni bog'laydi,
# composer + npm build qiladi, migratsiya qilib `current` symlink'ni atomik almashtiradi.
# Standalone ishlaydi: /var/www/qiyom/deploy.sh (server/deploy.sh dan nusxa).
set -euo pipefail

APP_DIR="/var/www/qiyom"
RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"
GIT_REPO="git@github.com:Nodir7393/elektr.git"
GIT_BRANCH="${GIT_BRANCH:-main}"
KEEP_RELEASES=5
PHP_FPM="php8.4-fpm"
WORKER="qiyom-worker"                    # supervisor dasturi (queue ishlatilsa)
HEALTHCHECK_URL="https://qiyomapi.pcbuild.uz/up"

echo "=========================================="
echo "  Deploy: $TIMESTAMP  (branch: $GIT_BRANCH)"
echo "=========================================="

PREVIOUS=""
[[ -L "$APP_DIR/current" ]] && PREVIOUS="$(readlink -f "$APP_DIR/current")"

rollback_on_fail() {
  echo "XATO: deploy muvaffaqiyatsiz." >&2
  if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
    ln -sfn "$PREVIOUS" "$APP_DIR/current"
    sudo systemctl reload "$PHP_FPM" 2>/dev/null || true
    echo "Oldingi relizga qaytarildi: $PREVIOUS" >&2
  fi
  [[ -d "$NEW_RELEASE" ]] && rm -rf "$NEW_RELEASE"
  exit 1
}
trap rollback_on_fail ERR

# 1. Klonlash
echo "[1/8] Klonlash..."
git clone --depth 1 --branch "$GIT_BRANCH" "$GIT_REPO" "$NEW_RELEASE"

# 2. Shared resurslarni bog'lash (backend)
echo "[2/8] Shared resurslarni bog'lash..."
ln -sfn "$SHARED_DIR/.env" "$NEW_RELEASE/api/.env"
rm -rf "$NEW_RELEASE/api/storage"
ln -sfn "$SHARED_DIR/storage" "$NEW_RELEASE/api/storage"

# 3. Backend: composer
echo "[3/8] PHP paketlari (composer)..."
cd "$NEW_RELEASE/api"
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Backend: migratsiya + Laravel optimize
echo "[4/8] Migratsiya + optimize..."
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan storage:link 2>/dev/null || true

# 5. Frontend: statik build (Vite -> pwa/dist)
echo "[5/8] Frontend build..."
cd "$NEW_RELEASE/pwa"
if [[ -f "$SHARED_DIR/.env.frontend" ]]; then
  cp "$SHARED_DIR/.env.frontend" .env.local     # VITE_API_URL=...
fi
npm ci
npm run build

# 6. Atomik almashtirish (ZERO DOWNTIME)
echo "[6/8] current -> $TIMESTAMP"
ln -sfn "$NEW_RELEASE" "$APP_DIR/current"

# 7. Servislarni yangilash
echo "[7/8] Servislarni yangilash..."
php "$APP_DIR/current/api/artisan" queue:restart 2>/dev/null || true
sudo supervisorctl restart "$WORKER":* 2>/dev/null || true
sudo systemctl reload "$PHP_FPM" 2>/dev/null || true

# 8. Eski relizlarni tozalash (symlink allaqachon almashdi — bundan keyin xato deployni buzmasin)
echo "[8/8] Eski relizlarni tozalash (saqlanadi: $KEEP_RELEASES)..."
trap - ERR

# health-check (non-fatal ogohlantirish — symlink allaqachon almashgani uchun deployni bekor qilmaydi)
if [[ -n "${HEALTHCHECK_URL:-}" ]]; then
  ok=0
  for i in $(seq 1 10); do
    if curl -fsS -o /dev/null "$HEALTHCHECK_URL"; then ok=1; break; fi
    sleep 3
  done
  [[ "$ok" == "1" ]] || echo "OGOHLANTIRISH: health-check o'tmadi: $HEALTHCHECK_URL (nginx current'ga qaratilganini tekshiring)" >&2
fi

cd "$RELEASES_DIR"
ls -dt */ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

echo "=========================================="
echo "  DEPLOYED: $TIMESTAMP"
echo "  Rollback: bash $APP_DIR/rollback.sh"
echo "=========================================="
