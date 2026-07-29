#!/bin/bash
# qiyom — oldingi relizga qaytarish (native).
# `current` symlink'ni bir oldingi relizga o'tkazadi va servislarni yangilaydi.
set -euo pipefail

APP_DIR="/var/www/qiyom"
RELEASES_DIR="$APP_DIR/releases"
PHP_FPM="php8.4-fpm"
WORKER="qiyom-worker"

CURRENT="$(readlink -f "$APP_DIR/current" 2>/dev/null || true)"
CURRENT_NAME="$(basename "$CURRENT" 2>/dev/null || echo '')"
PREVIOUS="$(ls -dt "$RELEASES_DIR"/*/ 2>/dev/null | grep -v "$CURRENT_NAME" | head -1 || true)"

if [[ -z "$PREVIOUS" ]]; then
  echo "XATO: Qaytish uchun oldingi reliz topilmadi!" >&2
  exit 1
fi

echo "  Current:  ${CURRENT_NAME:-<none>}"
echo "  Rollback: $(basename "$PREVIOUS")"

if [[ "${1:-}" != "-y" ]]; then
  read -p "Davom etasizmi? (y/n): " -n 1 -r; echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && echo "Bekor qilindi." && exit 0
fi

ln -sfn "${PREVIOUS%/}" "$APP_DIR/current"
php "$APP_DIR/current/api/artisan" queue:restart 2>/dev/null || true
sudo supervisorctl restart "$WORKER":* 2>/dev/null || true
sudo systemctl reload "$PHP_FPM" 2>/dev/null || true

echo "  ROLLBACK COMPLETE!"
