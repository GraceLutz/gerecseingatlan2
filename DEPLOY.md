# Gerecse Ingatlan — Production Deployment Guide

## Architecture Overview

```
                  ┌──────────────┐
  HTTPS :443 ──►  │    nginx     │
                  │  static dist │──► dist/ (Vite build output)
                  │  /api proxy  │──► Express :3001 (pm2)
                  └──────────────┘
                         │
                    ┌────┴─────┐
                    │ Supabase │  (PostgreSQL via transaction pooler)
                    └──────────┘
```

- **Frontend**: Vite + React SPA, built to `dist/` with hashed assets
- **Backend**: Express on port 3001 (production), API-only mode (no static serving)
- **Process manager**: pm2 with `ecosystem.config.cjs`
- **Reverse proxy**: nginx serves static files, proxies `/api/*` to Express
- **Database**: PostgreSQL on Supabase (transaction pooler), managed via Drizzle ORM

## Prerequisites

On the VPS (Ubuntu/Debian):

```bash
# Node.js 18+ (via nvm or nodesource)
node --version   # v18.x or higher

# npm (bundled with Node)
npm --version

# pm2 (global)
npm install -g pm2

# nginx
sudo apt install nginx

# certbot (for SSL — already configured)
sudo certbot --nginx -d gerecseingatlan.hu -d www.gerecseingatlan.hu
```

## First-Time Setup

### 1. Clone the repository

```bash
cd /var/www
git clone <repo-url> gerecseingatlan2
cd gerecseingatlan2
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with production values:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Must be `production` | `production` |
| `PORT` | Express listen port (set in ecosystem.config.cjs) | `3001` |
| `DATABASE_URL` | Supabase transaction pooler URL | `postgresql://postgres.xxx:password@...pooler.supabase.com:6543/postgres` |
| `SMTP_HOST` | Mail server host | `smtp.gerecseingatlan.hu` |
| `SMTP_PORT` | Mail server port | `465` |
| `SMTP_USER` | SMTP username | `info@gerecseingatlan.hu` |
| `SMTP_PASS` | SMTP password | *(from mail provider)* |
| `EMAIL_TO` | Contact form recipient | `info@gerecseingatlan.hu` |
| `VITE_GA4_ID` | Google Analytics 4 ID | `G-XXXXXXXXXX` |
| `INGATLAN_XML_URL` | Property feed URL | *(from ingatlanszoftver.hu)* |
| `SITE_URL` | Canonical site URL | `https://gerecseingatlan.hu` |

**Important**: `VITE_*` variables are baked into the frontend at build time. If you change them, you must rebuild.

### 3. Install dependencies and build

```bash
npm ci --production=false
npm run build
```

### 4. Run database migrations

```bash
npx drizzle-kit migrate
```

### 5. Install nginx config

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/gerecseingatlan
sudo ln -sf /etc/nginx/sites-available/gerecseingatlan /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Run the deploy script with first-run flag

```bash
chmod +x deploy.sh
./deploy.sh --first-run
```

This will: install nginx config, start pm2, configure pm2 startup, and verify everything.

### 7. Seed the database (first time only)

```bash
npm run db:seed
```

### 8. Verify

```bash
curl -I https://gerecseingatlan.hu          # Should return 200
curl -s https://gerecseingatlan.hu/api/content | head -c 200  # JSON response
pm2 status                                  # gerecse-ingatlan: online
```

## Routine Deployment

After pushing changes to the repository:

```bash
cd /var/www/gerecseingatlan2
./deploy.sh
```

The script does: `git pull → npm ci → npm run build → drizzle migrate → pm2 reload → verify`.

### Flags

| Flag | Effect |
|------|--------|
| `--first-run` | Initial setup: install nginx config, configure pm2 startup |
| `--skip-install` | Skip `npm ci` (use when no dependency changes) |
| `--skip-build` | Skip `npm run build` (use when only backend code changed) |
| `--skip-migrate` | Skip database migrations (use when no schema changes) |

### Backend-only deploy (faster)

```bash
./deploy.sh --skip-build
```

### Quick content change verify

1. Make a text change in the CMS admin at `/admin`
2. Refresh the public page — change should appear within seconds
3. No redeploy needed for CMS content changes (they're in the database)

## File Structure

| File | Purpose |
|------|---------|
| `deploy.sh` | Automated deploy script |
| `ecosystem.config.cjs` | PM2 process configuration |
| `deploy/nginx.conf` | nginx site configuration |
| `deploy/backup.sh` | Database backup script |
| `deploy/monitor.sh` | Uptime monitoring script |
| `.env.local` | Production environment variables (not in git) |

## Common Operations

### View logs

```bash
pm2 logs gerecse-ingatlan          # Live tail
pm2 logs gerecse-ingatlan --lines 100  # Last 100 lines
```

### Restart backend

```bash
pm2 reload ecosystem.config.cjs   # Zero-downtime reload
pm2 restart gerecse-ingatlan       # Hard restart
```

### Check process status

```bash
pm2 status
pm2 monit   # Real-time dashboard
```

### Update nginx config

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/gerecseingatlan
sudo nginx -t && sudo systemctl reload nginx
```

### Database operations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply pending migrations
npx drizzle-kit migrate

# Open Drizzle Studio (dev only)
npx drizzle-kit studio
```

### Manual backup

```bash
./deploy/backup.sh
```

## Rollback

If a deploy breaks the site, roll back to the previous working state:

### Quick rollback (revert last deploy)

```bash
cd /var/www/gerecseingatlan2

# Revert to the previous commit
git log --oneline -5               # Find the last known-good commit
git checkout <commit-hash> -- .    # Restore files from that commit

# Rebuild and restart
npm run build
pm2 reload ecosystem.config.cjs --env production
pm2 save
```

### Full rollback (reset to specific commit)

```bash
cd /var/www/gerecseingatlan2

git reset --hard <commit-hash>     # Reset to known-good commit
npm ci --production=false          # Reinstall deps (lockfile may differ)
npm run build
pm2 reload ecosystem.config.cjs --env production
pm2 save
```

### Database rollback

Drizzle ORM migrations are forward-only by default. If a migration caused issues:

1. Restore from backup: `./deploy/backup.sh` creates timestamped dumps
2. Check `deploy/backups/` for the most recent pre-deploy dump
3. Restore: `psql "$DATABASE_URL" < deploy/backups/gerecse_YYYY-MM-DD_HHMMSS.sql`

## Troubleshooting

### Site returns 502 Bad Gateway

The Express backend is down or not responding.

```bash
pm2 status                    # Is gerecse-ingatlan online?
pm2 logs gerecse-ingatlan     # Check for errors
pm2 restart gerecse-ingatlan  # Try restarting
```

### Build fails

```bash
npm run build 2>&1 | tail -50   # Check build errors
node --version                   # Ensure Node 18+
rm -rf node_modules && npm ci    # Clean install
```

### API returns HTML instead of JSON

The Express backend's JSON error handler should catch all `/api/*` errors. If you see HTML:

1. Check that nginx is proxying `/api` to Express, not serving from `dist/`
2. Check `pm2 logs` for startup errors in the backend
3. Verify `ecosystem.config.cjs` has `NODE_ENV=production`

### PM2 not surviving reboots

```bash
pm2 save                  # Save current process list
pm2 startup               # Generate startup script
# Run the command it prints (requires sudo)
pm2 save                  # Save again after startup is configured
```

### VITE_ env variable not reflected on the site

`VITE_*` variables are embedded at build time, not runtime.

```bash
# After changing VITE_* in .env.local:
npm run build
pm2 reload ecosystem.config.cjs
```

### SSL certificate renewal

Certbot auto-renews via systemd timer. Verify:

```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```
