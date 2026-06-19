# mtgv-api — Claude Context

## What this is
Node.js/Express REST API for MTGVersioner. Fetches card version data from a MongoDB Atlas database (populated nightly from Scryfall bulk data) and serves it to mtgv-web. Also exposes a WebSocket server for real-time package update broadcasting.

## Architecture: MSC pattern
Model → Service → Controller (no Mongoose — uses MongoDB Node driver directly)

- `src/models/` — Card, CardPackage (extend base model.js)
- `src/services/` — cardPackageCreator, cardPackageExporter, tcgPlayerService, websocketService
- `src/controllers/` — cardPackagesController, cardsController
- `src/routes/routes.js` — all routes registered here
- `src/middleware/` — validateParams, rateLimiter (strictLimiter/searchLimiter), requestLogger, performanceMonitor, errorHandler, security
- `src/lib/` — logger (Winston), helper, errors, redis

## API routes
| Method | Path | Notes |
|--------|------|-------|
| GET | `/cards` | Card search, searchLimiter |
| POST | `/card_package` | Create package, strictLimiter |
| GET | `/card_package/:id` | Fetch saved package |
| GET | `/card_package/random` | Random package, strictLimiter |
| POST | `/card_package/export` | Export, strictLimiter |
| GET | `/websocket/stats` | WebSocket connection stats |
| GET | `/health` | Health check |
| GET | `/metrics` | Performance metrics (not public-facing long-term) |

## Key technical details
- **Runtime**: Node >=23, ES modules (`"type": "module"`)
- **Database**: MongoDB Atlas M0 (free tier, staging); driver: `mongodb` npm package
- **Cache**: Redis via `ioredis`
- **WebSocket**: `ws` package, same port as HTTP (4000)
- **Logging**: Winston, structured JSON in production
- **Rate limiting**: express-rate-limit (in-memory, not Redis-backed yet)
- **Deployment**: Docker → Render starter tier
- **Cron job**: `pullBulkData.js` runs nightly at `0 0 * * *` (UTC), streams Scryfall bulk JSON, upserts cards via bulkWrite (BATCH_SIZE=200)

## npm scripts
- `npm run dev` — nodemon with --inspect
- `npm test` — Jest with mongodb-memory-server
- `npm run pullBulkData` — manual trigger (local)
- `npm run pullBulkData:staging` — manual trigger against staging DB
- `npm run docker:build / docker:run` — local Docker

## Testing
- Jest + supertest + sinon + mongodb-memory-server
- Config: `tests/config/jest.config.js`
- Integration tests hit an in-memory MongoDB (no mocks for DB layer)

## Environment variables
See `Secrets management & key security` Notion card for full list.
Key vars: `DB_URL`, `DB_URL_STAGING`, `DB_NAME`, `REDIS_URL`, `NODE_ENV`, `PORT`
Never commit `.env` files — use `.env.example` with placeholder values only.

## Hosting (Render)
- Staging service live; production not yet launched
- Cold start ~11s on starter tier — always-on instances needed for production
- Cron job: separate Render cron service running `npm run pullBulkData`

## Notion tracking
MTGVersioner kanban: https://app.notion.com/p/bramleyjl/d7f0ee3c2cec4f079e48698232dfe02e?v=e577c2a446b848b9964d1880d158daef
Collection ID (for MCP queries): `b3d9cce2-f7ec-4f8c-9596-7271988b3b14`

## Known deferred work (Icebox)
- CORS wildcard → whitelist (code in security.js, needs deploy)
- Redis-backed rate limiting
- npm audit fixes (29 vulns as of June 2026)
- WebSocket auth
- MongoDB M0 → M10+ upgrade (encryption, backups)
