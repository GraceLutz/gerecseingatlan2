#!/usr/bin/env bash
# deploy.sh — Repeatable deploy script for Gerecse Ingatlan
# Usage: ./deploy.sh [--first-run] [--skip-install] [--skip-build]
#
# Steps: pull → install → build → migrate → restart pm2 → verify
# See DEPLOY.md for full setup and troubleshooting docs.

set -euo pipefail

# ─── Configuration ─────────────────────────────────────────
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="gerecse-ingatlan"
DIST_DIR="${APP_DIR}/dist"
ENV_FILE="${APP_DIR}/.env.local"
LOG_PREFIX="[deploy]"

# ─── Flags ─────────────────────────────────────────────────
SKIP_INSTALL=false
SKIP_BUILD=false
SKIP_MIGRATE=false
FIRST_RUN=false

for arg in "$@"; do
  case "$arg" in
    --first-run)     FIRST_RUN=true ;;
    --skip-install)  SKIP_INSTALL=true ;;
    --skip-build)    SKIP_BUILD=true ;;
    --skip-migrate)  SKIP_MIGRATE=true ;;
    --help|-h)
      echo "Usage: ./deploy.sh [--first-run] [--skip-install] [--skip-build] [--skip-migrate]"
      echo ""
      echo "  --first-run     Initial setup: install nginx config, configure pm2 startup"
      echo "  --skip-install  Skip npm ci (use when no dependency changes)"
      echo "  --skip-build    Skip npm run build (use when only backend code changed)"
      echo "  --skip-migrate  Skip database migrations"
      exit 0
      ;;
    *)
      echo "${LOG_PREFIX} Unknown flag: $arg" >&2
      exit 1
      ;;
  esac
done

# ─── Helpers ───────────────────────────────────────────────
log()   { echo "${LOG_PREFIX} $(date '+%Y-%m-%d %H:%M:%S') $*"; }
error() { echo "${LOG_PREFIX} ERROR: $*" >&2; exit 1; }

# ─── Pre-flight checks ────────────────────────────────────
cd "$APP_DIR"

[[ -f "$ENV_FILE" ]] || error ".env.local not found at ${ENV_FILE}. Copy .env.example and fill in production values."
command -v node >/dev/null || error "node is not installed (need v18+)"
command -v npm  >/dev/null || error "npm is not installed"
command -v pm2  >/dev/null || error "pm2 is not installed (npm install -g pm2)"
[[ -f "ecosystem.config.cjs" ]] || error "ecosystem.config.cjs not found — see DEPLOY.md"

NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if (( NODE_MAJOR < 18 )); then
  error "Node.js v18+ required (found v${NODE_MAJOR})"
fi

# ─── Step 1: Pull latest code ─────────────────────────────
log "Pulling latest code..."
git pull --ff-only || error "git pull failed — resolve conflicts manually"

# ─── Step 2: Install dependencies ──────────────────────────
if [[ "$SKIP_INSTALL" == "false" ]]; then
  log "Installing dependencies..."
  npm ci --production=false
else
  log "Skipping npm install (--skip-install)"
fi

# ─── Step 3: Build frontend ───────────────────────────────
if [[ "$SKIP_BUILD" == "false" ]]; then
  log "Building frontend..."
  npm run build

  [[ -f "${DIST_DIR}/index.html" ]] || error "Build failed — dist/index.html not found"
  ASSET_COUNT=$(find "${DIST_DIR}/assets" -type f 2>/dev/null | wc -l)
  log "Build complete: ${ASSET_COUNT} assets in dist/"
else
  log "Skipping frontend build (--skip-build)"
  [[ -f "${DIST_DIR}/index.html" ]] || error "dist/index.html not found — run without --skip-build first"
fi

# ─── Step 4: Create log directory ─────────────────────────
mkdir -p "${APP_DIR}/logs"

# ─── Step 5: Run database migrations ──────────────────────
if [[ "$SKIP_MIGRATE" == "false" ]]; then
  log "Running database migrations..."
  npx drizzle-kit migrate || error "Database migration failed — fix the migration or use --skip-migrate to bypass"
else
  log "Skipping database migrations (--skip-migrate)"
fi

# ─── Step 6: Start / Restart PM2 ──────────────────────────
log "Restarting PM2 process..."
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production
else
  log "PM2 process not found — starting fresh..."
  pm2 start ecosystem.config.cjs --env production
fi

pm2 save

# ─── Step 7: First-run setup ──────────────────────────────
if [[ "$FIRST_RUN" == "true" ]]; then
  log "=== First-run setup ==="

  # Install nginx config
  if [[ -f "deploy/nginx.conf" ]]; then
    log "Installing nginx site config..."
    sudo cp deploy/nginx.conf /etc/nginx/sites-available/gerecseingatlan
    sudo ln -sf /etc/nginx/sites-available/gerecseingatlan /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    log "Nginx configured and reloaded"
  else
    log "WARNING: deploy/nginx.conf not found — configure nginx manually"
  fi

  # Configure PM2 startup
  log "Configuring PM2 startup..."
  pm2 startup
  log ">>> Run the 'sudo env ...' command printed above if prompted <<<"
  pm2 save

  log "=== First-run setup complete ==="
fi

# ─── Step 8: Reload nginx (non-first-run) ─────────────────
if [[ "$FIRST_RUN" == "false" ]] && command -v nginx >/dev/null 2>&1; then
  log "Testing nginx config..."
  if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx
    log "Nginx reloaded"
  fi
fi

# ─── Step 9: Verify ───────────────────────────────────────
log "Verifying deployment..."
sleep 2

# Check PM2 process is online
PM2_STATUS=$(pm2 jlist 2>/dev/null | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const p = d.find(x => x.name === '${APP_NAME}');
  console.log(p ? p.pm2_env.status : 'not_found');
" 2>/dev/null || echo "unknown")

if [[ "$PM2_STATUS" != "online" ]]; then
  error "PM2 process '${APP_NAME}' is not online (status: ${PM2_STATUS}). Check: pm2 logs ${APP_NAME}"
fi
log "PM2 process '${APP_NAME}' is online"

# Health check against the local backend
BACKEND_PORT=$(node -e "
  try {
    const c = require('./ecosystem.config.cjs');
    const a = c.apps[0];
    console.log((a.env_production && a.env_production.PORT) || (a.env && a.env.PORT) || 3001);
  } catch(e) { console.log(3001); }
" 2>/dev/null || echo "3001")
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${BACKEND_PORT}/api/content" --max-time 5 2>/dev/null || echo "000")
if [[ "$HEALTH_CODE" == "200" ]]; then
  log "Health check passed (HTTP ${HEALTH_CODE})"
else
  log "WARNING: Health check returned HTTP ${HEALTH_CODE} — verify manually"
fi

# ─── Done ──────────────────────────────────────────────────
log "========================================="
log "Deploy complete!"
log "Verify live site: https://gerecseingatlan.hu"
log "View logs:        pm2 logs ${APP_NAME}"
log "========================================="
