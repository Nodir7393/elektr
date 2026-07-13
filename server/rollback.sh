#!/usr/bin/env bash
# qiyom — oldingi relizga qaytarish.
# `current` symlink'ni bir oldingi (vaqt bo'yicha) relizga o'tkazadi va servislarni qayta ko'taradi.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF="${SCRIPT_DIR}/deploy.conf"
[[ -f "$CONF" ]] || { echo "XATO: ${CONF} topilmadi." >&2; exit 1; }
# shellcheck disable=SC1090
source "$CONF"

: "${COMPOSE:=docker compose}"
RELEASES_DIR="${SERVER_PATH}/releases"
CURRENT="${SERVER_PATH}/current"

log() { echo -e "\033[1;34m==>\033[0m $*"; }

CURRENT_TARGET=""
[[ -L "$CURRENT" ]] && CURRENT_TARGET="$(readlink -f "$CURRENT")"

# Joriydan boshqa, eng so'nggi relizni topamiz
TARGET=""
while IFS= read -r dir; do
  dir="${dir%/}"
  if [[ "$dir" != "$CURRENT_TARGET" ]]; then TARGET="$dir"; break; fi
done < <(ls -1dt "${RELEASES_DIR}"/*/ 2>/dev/null)

if [[ -z "$TARGET" ]]; then
  echo "XATO: Qaytish uchun oldingi reliz topilmadi." >&2
  exit 1
fi

log "Rollback: ${CURRENT_TARGET:-<none>}  ->  ${TARGET}"
ln -sfn "$TARGET" "$CURRENT"
( cd "$CURRENT" && $COMPOSE up -d --remove-orphans )

log "Rollback tugadi."
