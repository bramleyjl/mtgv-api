# MTGV Environments

Reference for how staging and (eventually) production are actually configured. This is a
setup/reference doc, not a task tracker: planned work and open decisions live on the MTGV Notion
board (`Production infrastructure & launch`, `Security hardening pre-production`, `Secrets
management & key security` cards), not here.

Local dev setup lives in each repo's `README.md` (`Installation & Setup`) — not duplicated here.

---

## Staging — self-hosted on pangolin (current)

Runs on John's home server (`ssh pangolin`) via Docker Compose: `mtgv-api` + `mtgv-web` + `redis`
containers, MongoDB stays on Atlas (staging cluster, M0 free tier). Access is Tailscale/LAN-only —
no public exposure.

- **Full setup, deploy, and ops instructions**: `mtgv-api/deploy/STAGING_PANGOLIN.md` (layout on
  the host, deploy/redeploy commands, nightly card-data sync via systemd timer, port binding /
  firewall rationale)
- **Access**: `http://100.105.186.7:3000` (Tailscale) or `http://192.168.0.102:3000` (LAN); API
  health check at `<host>:4000/health`
- **Reviewed live 2026-09-05**: Docker port bindings, ufw rules, `.env` permissions (chmod 600),
  container uptime, and security headers/CORS all confirmed correct — see `Security hardening
  pre-production` and `laptop server staging` Notion cards for the full review notes and any open
  follow-ups.

## Staging — Render (suspended, not deleted)

Was the original staging host; suspended 2026-08-02 to cut the $15/month bill during a
low-activity period. Services still exist and can be resumed:

- `mtgv-api` — `srv-d1av506uk2gs7396rok0`
- `mtgv-web` — `srv-d2pq9j75r7bs73a07vo0`
- Redis key-value service (id not on record)
- `update-staging-db` cron — `crn-d6evvl0gjchc73e1ba40`

If resumed: auto-deploy from GitHub `main`, free-tier services spin down after 15min inactivity
with slow cold starts (~11s) — this was the original motivation for moving to pangolin.

---

## Production

**Not yet launched.** Hosting target is an open decision — self-host on pangolin (needs public
exposure + real TLS via existing Caddy) vs. resume Render (simpler, $15/mo, already proven). See
the `Production infrastructure & launch` Notion card for the current state of that decision and
its prerequisites. This doc gets a real "Production" setup section once that's settled and
something is actually running.

---

## Monitoring & Observability

**Current state (all environments):**

- Structured logging via Winston in `mtgv-api` (`src/lib/logger.js`)
- Request logging + performance monitoring middleware (`requestLogger.js`, `performanceMonitor.js`)
- `GET /health` and `GET /metrics` endpoints on `mtgv-api`
- `GET /websocket/stats` for WebSocket connection counts
- On pangolin: `docker compose logs -f api web`, `docker compose ps`
- **No external error tracking, uptime monitoring, or APM configured anywhere** — out of scope for
  a personal staging box; revisit if/when this becomes more than occasional use or production
  launches.

No specific tooling (Sentry, UptimeRobot, etc.) is committed to yet — when monitoring becomes a
real priority, that decision and its options belong on the Notion board, not as a standing list
here.
