# Self-hosted staging (pangolin)

Replaces the Render staging services (`mtgv-api`, `mtgv-web`, `update-staging-db` cron) to cut the
$15/month Render bill while MTGV isn't seeing active development. Database stays on MongoDB Atlas
(staging cluster, M0 free tier) — nothing to self-host there. Access is Tailscale/LAN-only, no
public exposure — this is a personal dev environment, not a public deploy.

## Layout on pangolin

```
~/Projects/mtgv-staging/
  mtgv-api/                       # git clone git@github.com:bramleyjl/mtgv-api.git
  mtgv-web/                       # git clone git@github.com:bramleyjl/mtgv-web.git
  docker-compose.yml              # copy of deploy/docker-compose.staging.yml
  .env                            # from deploy/staging.env.example, chmod 600
```

## Deploy / redeploy

```
cd ~/Projects/mtgv-staging
git -C mtgv-api pull
git -C mtgv-web pull
docker compose build
docker compose up -d
```

There's no auto-deploy (Render's git-push-to-deploy is gone) — pull + rebuild manually, or via
the `mtgv-deploy` alias set up in `.zshrc` (SSH's in and runs the above).

## Nightly card data sync

Render's `update-staging-db` cron is replaced by a systemd timer on pangolin
(`mtgv-staging-pulldata.timer`, daily 00:00 UTC) running:

```
docker compose exec -T api npm run pullBulkData:staging
```

Check status: `systemctl status mtgv-staging-pulldata.timer` /
`journalctl -u mtgv-staging-pulldata.service -f`

## Access

- Web UI: `http://<TAILSCALE_IP>:3000` or `http://<LAN_IP>:3000`
- API: `http://<TAILSCALE_IP>:4000` (health check: `/health`)
- Ports are published bound to specific host IPs (LAN + Tailscale only) in
  `docker-compose.staging.yml` — not exposed on `0.0.0.0`, so no ufw rule is strictly required, but
  matching ufw rules were added for defense in depth (see `server-help` on pangolin).

## Monitoring

- `docker compose ps` / `docker compose logs -f api web`
- Containers run with `restart: unless-stopped` — survive reboot and crash-restart.
- No external uptime monitoring configured (out of scope for a personal staging box); check in
  manually or add one later if this becomes more than occasional use.
