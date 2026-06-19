# MTGV Hosting & Monitoring Strategy

## Cost-Effective, Performant, Scalable

---

## Current State (FREE Tier)

### Render.com Hosting

**Frontend (mtgv-web)**:

- Free tier web service
- Auto-deploy from GitHub (main branch)
- URL: <https://mtgv-web.onrender.com>
- Limitations: Spins down after 15min inactivity, slow cold starts

**Backend (mtgv-api)**:

- Free tier web service
- Docker container
- URL: <https://mtgv-api.onrender.com>
- Limitations: Same as frontend

**Database (MongoDB Atlas)**:

- M0 Free tier: 512MB storage, shared resources
- 112,579 cards currently stored
- Limitations: 512MB limit, no backups, shared cluster

**Cache (Redis)**:

- Currently using Render's ephemeral storage (not persistent)
- Limitations: Lost on every deployment/restart

**Cron Job**:

- Daily card database update (00:00 UTC)
- Free tier cron job
- Limitations: Memory constraints (512MB), can OOM

---

## Recommended Staging Environment (HOBBY TIER)

**Target: Minimal cost for full-featured staging**

### Option A: All-Render ($12/month) ⭐ RECOMMENDED FOR STAGING

| Service | Tier | Cost | Specs |
|---------|------|------|-------|
| Frontend | Starter | $7/mo | Always on, 512MB RAM |
| Backend | Starter | $7/mo | Always on, 512MB RAM |
| Database | MongoDB Atlas M0 | FREE | 512MB storage |
| Cache | Render Redis | FREE | 25MB ephemeral |
| **TOTAL** | | **$14/mo** | |

**Pros**:

- Simple: Everything in one platform
- Auto-deployment from GitHub
- Built-in SSL, custom domains
- Good for staging/testing

**Cons**:

- 512MB RAM per service (limited for backend with large datasets)
- Redis not persistent (lost on restart)
- Not the most cost-effective for production scale

### Option B: Hybrid Fly.io/Railway ($10/month)

| Service | Tier | Cost | Specs |
|---------|------|------|-------|
| Frontend | Vercel Hobby | FREE | Unlimited bandwidth, edge network |
| Backend | Fly.io | $5-10/mo | 256MB RAM, scales to zero |
| Database | MongoDB Atlas M0 | FREE | 512MB storage |
| Cache | Fly.io Redis | $2/mo | 256MB persistent |
| **TOTAL** | | **$7-12/mo** | |

**Pros**:

- Vercel is excellent for Next.js (faster than Render)
- Fly.io scales to zero (pay for actual usage)
- Persistent Redis cache

**Cons**:

- Multiple platforms to manage
- Vercel hobby tier has some limitations (commercial use disclaimer)

### Option C: Railway ($5/month + usage)

| Service | Tier | Cost | Specs |
|---------|------|------|-------|
| Frontend | Railway | ~$3/mo | Usage-based |
| Backend | Railway | ~$3/mo | Usage-based |
| Database | MongoDB Atlas M0 | FREE | 512MB storage |
| Cache | Railway Redis | ~$2/mo | 256MB persistent |
| **TOTAL** | | **~$8-10/mo** | Plus $5 credit/month free |

**Pros**:

- $5 free credit per month
- Pay only for what you use
- Excellent DX (developer experience)
- Built-in metrics and logging

**Cons**:

- Usage-based can be unpredictable
- Relatively new platform (less proven)

---

## Recommended Production Environment (PRODUCTION READY)

**Target: Performant, reliable, affordable**

### Option A: Vercel + Render ($32/month) ⭐ RECOMMENDED FOR PRODUCTION

| Service | Tier | Cost | Specs |
|---------|------|------|-------|
| Frontend | Vercel Pro | $20/mo | 100GB bandwidth, analytics |
| Backend | Render Standard | $25/mo | 2GB RAM, always on |
| Database | MongoDB Atlas M10 | $57/mo | 10GB storage, backups |
| Cache | Render Redis | FREE | Ephemeral OR Upstash $10/mo persistent |
| CDN | Cloudflare | FREE | In front of everything |
| **TOTAL** | | **$102-112/mo** | |

**Pros**:

- Vercel is THE platform for Next.js (made by same team)
- Automatic edge caching worldwide
- 2GB RAM backend handles Commander decks easily
- MongoDB backups and monitoring included
- Professional-grade uptime

**Cons**:

- Higher cost (~$100/month)
- Still limited to 2GB RAM on backend

### Option B: All-in-One Cloud (AWS/GCP/Azure) ($40-60/month)

| Service | Tier | Cost | Specs |
|---------|------|------|-------|
| Frontend | S3 + CloudFront | $5/mo | Static hosting + CDN |
| Backend | AWS ECS Fargate | $25/mo | 0.5 vCPU, 1GB RAM |
| Database | MongoDB Atlas M10 | $57/mo | 10GB, backups |
| Cache | ElastiCache | $13/mo | 0.5GB Redis |
| **TOTAL** | | **$100/mo** | |

**Pros**:

- Enterprise-grade reliability
- Fine-grained control
- Can optimize costs with Reserved Instances

**Cons**:

- Requires more DevOps knowledge
- Complexity (IAM, VPC, security groups, etc.)
- Billing can surprise you

### Option C: DigitalOcean App Platform ($40/month)

| Service | Tier | Cost | Specs |
|---------|------|------|-------|
| Frontend | App Platform | $12/mo | 1GB RAM |
| Backend | App Platform | $12/mo | 1GB RAM |
| Database | MongoDB Atlas M10 | $57/mo | 10GB, backups |
| Cache | DigitalOcean Redis | $15/mo | 1GB persistent |
| **TOTAL** | | **$96/mo** | |

**Pros**:

- Simple pricing
- Good performance
- Predictable bills

**Cons**:

- Less specialized than Vercel for Next.js
- Smaller ecosystem

---

## Monitoring & Observability Strategy

### Free/Hobby Tier ($0-10/month)

**Logging**:

- ✅ Render built-in logs (retention: 7 days on free tier, 30 days on paid)
- ✅ Console.log / Winston logger (already implemented)
- ⚡ Add structured logging with correlation IDs

**Error Tracking**:

- Option 1: **Sentry** - Free for 5k errors/month ⭐ RECOMMENDED
  - Install: `npm install @sentry/nextjs @sentry/node`
  - Automatic error capture, stack traces, user context
  - Alerts for new/recurring errors

- Option 2: **LogRocket** - Free for 1k sessions/month
  - Session replay (see what user did before error)
  - Performance monitoring

**Uptime Monitoring**:

- **UptimeRobot** - FREE for 50 monitors
  - Ping your site every 5 minutes
  - Email alerts on downtime
  - Public status page

**Performance Monitoring**:

- **Vercel Analytics** - FREE with Vercel deployment
  - Real user monitoring (RUM)
  - Web Vitals (LCP, FID, CLS)
  - Lighthouse scores

- OR **Google PageSpeed Insights** - FREE
  - Manual checks or API integration

**Custom Metrics** (DIY):

```javascript
// Add custom middleware to track:
- API response times
- Database query performance
- WebSocket connection count
- Cache hit rates
- Image load success/failure rates
```

### Production Tier ($20-50/month)

Everything from Hobby tier PLUS:

**APM (Application Performance Monitoring)**:

- **New Relic** - $99/month (but has free tier for 100GB/month)
- **Datadog** - $15/host/month
- **Elastic APM** - Self-hosted (cheaper but more work)

**Log Aggregation**:

- **Logtail (Better Stack)** - $10/month for 5GB
- **Papertrail** - $7/month for 1GB
- Centralized logs from all services

**Metrics & Dashboards**:

- **Grafana Cloud** - FREE for 10k series, 50GB logs
- **Prometheus** + **Grafana** (self-hosted)

**Synthetic Monitoring**:

- **Checkly** - $7/month
  - API checks from multiple locations
  - Browser checks (E2E testing in production)

---

## Recommended Monitoring Stack (Hobby → Production)

### Stage 1: Free Staging ($0/month)

```
- Sentry (error tracking) - 5k errors/mo FREE
- UptimeRobot (uptime) - 50 monitors FREE
- Render Logs (basic logging) - 7 days retention
- Custom Winston logger (structured logs)
```

### Stage 2: Paid Staging/Production ($20/month)

```
- Sentry Professional ($26/mo) - 50k errors/mo
- Better Stack Logs ($10/mo) - 5GB/month retention
- UptimeRobot Pro ($7/mo) - 1min checks, SMS alerts
- Grafana Cloud (FREE tier) - Metrics dashboard
```

### Stage 3: Full Production ($50-100/month)

```
- New Relic or Datadog ($15-99/mo) - Full APM
- Better Stack Logs ($20/mo) - 25GB/month
- PagerDuty ($19/mo) - On-call rotation, alerts
- Checkly ($15/mo) - Synthetic monitoring
```

---

## Implementation Roadmap

### Phase 1: Improve Current Free Setup (This Week)

- [ ] Add Sentry for error tracking (FREE tier)
- [ ] Set up UptimeRobot for health checks (FREE)
- [ ] Implement structured logging with Winston
- [ ] Add request correlation IDs
- [ ] Create custom middleware for basic metrics (response time, error rates)
- [ ] Add Cloudflare (FREE) in front for DDoS protection + CDN

**Cost**: $0/month
**Benefits**: Professional error tracking, uptime monitoring, better logs

### Phase 2: Upgrade to Hobby Tier (Next 2 Weeks)

- [ ] Upgrade Render frontend to Starter ($7/mo)
- [ ] Upgrade Render backend to Starter ($7/mo)
- [ ] OR migrate frontend to Vercel (FREE hobby tier)
- [ ] Add Upstash Redis ($10/mo) for persistent cache
- [ ] Set up Better Stack Logs ($10/mo)

**Cost**: $14-34/month
**Benefits**: Always-on services, persistent cache, better logging

### Phase 3: Production Ready (When Launching)

- [ ] Migrate frontend to Vercel Pro ($20/mo)
- [ ] Upgrade MongoDB to Atlas M10 ($57/mo) with backups
- [ ] Upgrade Render backend to Standard ($25/mo) - 2GB RAM
- [ ] Add New Relic or Datadog APM ($15-99/mo)
- [ ] Set up PagerDuty for alerts ($19/mo)
- [ ] Custom domain + SSL

**Cost**: $100-150/month
**Benefits**: Enterprise-grade reliability, performance, observability

---

## Performance Targets

### Current (Free Tier)

- Cold start: 30-60 seconds 😞
- Warm response: 200-500ms ✅
- Commander deck (80 cards): 3-5 seconds initial load 😐

### Target (Paid Staging)

- Cold start: N/A (always on) ✅
- Warm response: 100-200ms ✅
- Commander deck (80 cards): 1-2 seconds initial load ✅

### Target (Production)

- Response time: &lt;100ms (p95) ⭐
- Commander deck: &lt;1 second (with edge caching) ⭐
- Uptime: 99.9% ⭐
- Error rate: &lt;0.1% ⭐

---

## Cost Summary

| Stage | Monthly Cost | What You Get |
|-------|--------------|--------------|
| **Current (Free)** | $0 | Works but limited, cold starts, no persistence |
| **Hobby Staging** | $14-34 | Always on, good for testing, minimal monitoring |
| **Production MVP** | $100-150 | Professional-grade, 99.9% uptime, full monitoring |
| **Scale (1000+ users)** | $200-400 | Auto-scaling, CDN, enterprise features |

---

## Immediate Next Steps (This Week)

1. **Add Basic Monitoring** (FREE):

   ```bash
   # Frontend
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs

   # Backend
   npm install @sentry/node
   ```

2. **Set Up UptimeRobot** (FREE):
   - Create account at uptimerobot.com
   - Add monitors for:
     - <https://mtgv-web.onrender.com>
     - <https://mtgv-api.onrender.com/websocket/stats>
   - Configure email alerts

3. **Add Structured Logging**:
   - Enhance Winston logger with correlation IDs
   - Add request/response logging middleware
   - Log performance metrics (response times, cache hits)

4. **Add Cloudflare** (FREE):
   - Point domain through Cloudflare
   - Enable CDN caching
   - Add DDoS protection

**Total Cost**: $0
**Time Investment**: 2-4 hours
**Impact**: Professional-grade monitoring without spending money

---

## Questions to Decide

1. **When do you want to launch to real users?**
   - If soon: Immediately go to Phase 2 (Hobby tier ~$30/mo)
   - If later: Stay on free tier, add monitoring

2. **Expected traffic at launch?**
   - &lt;10 concurrent users: Free tier works
   - 10-50 concurrent users: Hobby tier needed
   - 50+ concurrent users: Production tier needed

3. **Budget for hosting?**
   - $0/month: Free tier + monitoring
   - $30/month: Hobby tier, great for staging + light production
   - $100/month: Full production setup
   - $200+/month: Scale with confidence

4. **Monitoring priorities?**
   - Must-have: Error tracking (Sentry), Uptime (UptimeRobot)
   - Nice-to-have: Log aggregation, Metrics dashboard
   - Later: Full APM, Synthetic monitoring

---

## My Recommendation

### For Next 2 Weeks (Completing MVP)

**Stay on FREE tier, add FREE monitoring**:

- Add Sentry for errors
- Add UptimeRobot for uptime
- Add structured logging
- Add Cloudflare

**Cost**: $0/month
**Benefit**: Professional monitoring, better insights

### When Ready to Launch (Week 3+)

**Upgrade to Hobby setup**:

- Frontend: Vercel (FREE hobby) or Render Starter ($7)
- Backend: Render Starter ($7)
- Database: MongoDB Atlas M0 (FREE)
- Redis: Upstash hobby ($10)
- Monitoring: Sentry Free + UptimeRobot Free

**Cost**: $7-24/month
**Benefit**: Always-on, fast, reliable staging environment

### For Real Production Launch

**Go to Production setup**:

- Frontend: Vercel Pro ($20)
- Backend: Render Standard ($25)
- Database: MongoDB Atlas M10 ($57)
- Redis: Upstash Pro ($10)
- Monitoring: Sentry Pro ($26) + Better Stack ($10)

**Cost**: ~$150/month
**Benefit**: Handle 100+ concurrent users, 99.9% uptime, professional support

---

**Bottom Line**: Your current free setup is fine for development. Add free monitoring NOW (Sentry + UptimeRobot). When you're ready to share with real users, budget ~$30/month for hobby tier or ~$150/month for production-ready hosting.
