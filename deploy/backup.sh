#!/usr/bin/env bash
# Weekly database backup for gerecseingatlan.hu (Supabase PostgreSQL)
# Usage: ./deploy/backup.sh
# Cron example (Sunday 3 AM): 0 3 * * 0 /var/www/gerecseingatlan2/deploy/backup.sh
# Restore: pg_restore --no-owner --no-privileges -d "$DATABASE_URL" backups/backup_YYYYMMDD_HHMMSS.dump
#
# Requires: pg_dump, pg_restore (for verification)
# Reads DATABASE_URL from .env.local in the project root

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
MAX_BACKUPS=7
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.dump"

if [[ -f "${PROJECT_DIR}/.env.local" ]]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' "${PROJECT_DIR}/.env.local" | cut -d'=' -f2-)"
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[BACKUP ERROR] DATABASE_URL not set. Check .env.local" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "[BACKUP] Starting database backup at $(date -Iseconds)"
echo "[BACKUP] Target: ${BACKUP_FILE}"

if pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$BACKUP_FILE"; then
  BACKUP_SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
  echo "[BACKUP] Success: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  echo "[BACKUP ERROR] pg_dump failed" >&2
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Verify the backup is restorable by listing its TOC
if pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1; then
  echo "[BACKUP] Restore verification passed"
else
  echo "[BACKUP ERROR] Backup file failed restore verification" >&2
  exit 1
fi

# Keep only the last N backups
DELETED="$(ls -t "$BACKUP_DIR"/backup_*.dump 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -v | wc -l)"
if [[ "$DELETED" -gt 0 ]]; then
  echo "[BACKUP] Removed ${DELETED} old backup(s), keeping last ${MAX_BACKUPS}"
fi

echo "[BACKUP] Done at $(date -Iseconds)"
