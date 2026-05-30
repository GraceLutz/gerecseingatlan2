/**
 * PM2 Ecosystem Configuration for Gerecse Ingatlan
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 save
 *   pm2 startup  (to persist across reboots)
 *
 * Application env vars (DATABASE_URL, SMTP_*, etc.) are loaded from .env.local
 * by the server itself via dotenv — they are NOT duplicated here.
 */
module.exports = {
  apps: [
    {
      name: "gerecse-ingatlan",

      // tsx runs TypeScript directly — same runtime as the dev script
      script: "node_modules/.bin/tsx",
      args: "server/index.ts",

      instances: 1,
      exec_mode: "fork",

      // Environment — production values
      // .env.local is loaded by the app via dotenv; only runtime overrides go here
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Development fallback (pm2 start ecosystem.config.cjs --env development)
      env_development: {
        NODE_ENV: "development",
        PORT: 8080,
      },

      // Restart policy
      autorestart: true,
      max_restarts: 15,
      min_uptime: "10s",
      restart_delay: 4000,
      max_memory_restart: "512M",
      watch: false,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      merge_logs: true,

      // Source maps off in production (Vite build already disables them)
      source_map_support: false,
    },
  ],
};
