#!/usr/bin/env bash
# Uptime monitor for gerecseingatlan.hu
# Usage: ./deploy/monitor.sh
# Cron example (every 5 min): */5 * * * * /var/www/gerecseingatlan2/deploy/monitor.sh
#
# Checks:
#   1. Public site responds with HTTP 200
#   2. API health check (content endpoint)
#   3. PM2 process is running
#
# Exit codes: 0 = all healthy, 1 = one or more checks failed

set -euo pipefail

SITE_URL="${SITE_URL:-https://gerecseingatlan.hu}"
API_URL="${SITE_URL}/api/content"
TIMEOUT=10
FAILURES=0

check() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  HTTP_STATUS="$(curl -s -o /dev/null -w '%{http_code}' --max-time "$TIMEOUT" "$url" 2>/dev/null)" || HTTP_STATUS="000"

  if [[ "$HTTP_STATUS" == "$expected_status" ]]; then
    echo "[MONITOR OK] ${name}: HTTP ${HTTP_STATUS}"
  else
    echo "[MONITOR FAIL] ${name}: HTTP ${HTTP_STATUS} (expected ${expected_status})" >&2
    FAILURES=$((FAILURES + 1))
  fi
}

echo "[MONITOR] Health check at $(date -Iseconds)"

check "Public site" "$SITE_URL"
check "API (content)" "$API_URL"

# PM2 process check (only runs on the server, skip if pm2 not available)
if command -v pm2 &>/dev/null; then
  PM2_STATUS="$(pm2 jlist 2>/dev/null | grep -o '"status":"online"' | head -1)" || PM2_STATUS=""
  if [[ -n "$PM2_STATUS" ]]; then
    echo "[MONITOR OK] PM2: process online"
  else
    echo "[MONITOR FAIL] PM2: no online process found" >&2
    FAILURES=$((FAILURES + 1))
  fi
else
  echo "[MONITOR SKIP] PM2: not installed (running remotely?)"
fi

if [[ "$FAILURES" -gt 0 ]]; then
  echo "[MONITOR] ${FAILURES} check(s) failed"
  exit 1
fi

echo "[MONITOR] All checks passed"
exit 0
