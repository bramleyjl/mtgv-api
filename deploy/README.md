# Deployment Configuration

This directory contains deployment-specific configurations for different environments.

---

## Cron Jobs - Automated Database Updates

### Overview

The MTG Versioner API uses an automated cron job to keep card data synchronized with Scryfall's bulk data API. This ensures our MongoDB Atlas database always has the latest card information.

### `render-cron.yaml` Configuration

A single staging cron job is configured:

#### **Staging Database Update** (`update-staging-db`)

- **Schedule**: Daily at 00:00 UTC (midnight)
- **Environment**: `staging`
- **Plan**: Render Starter tier
- **Region**: Oregon
- **Command**: `npm run pullBulkData`

### How It Works

1. **Daily Execution**: Render triggers the cron job at its scheduled time
2. **Stream Download**: Script streams the latest bulk data from Scryfall API (~200MB JSON file) without loading it entirely into memory
3. **Process On-The-Fly**: Cards are processed one-by-one as they stream in, using a streaming JSON parser
4. **Insert in Batches**: Cards are inserted into MongoDB in batches of 300 to stay within Render's 512MB memory limit
5. **Cleanup**: Old data is cleared before import, unique cards are deduplicated during streaming
6. **Logging**: All operations are logged with Winston at `info` level

### Memory Optimization

The `pullBulkData` script is heavily optimized for Render's free/starter tier memory constraints:

- **Streaming Download**: Uses `responseType: 'stream'` instead of loading entire file into memory
- **Streaming JSON Parser**: `stream-json` library processes cards one-by-one from the stream
- **Batch Size**: 300 cards per insert operation (reduced from previous 500)
- **Memory Management**: Stream pauses during database inserts to prevent backpressure
- **Deduplication**: Set-based tracking of seen card IDs to prevent duplicates
- **Garbage Collection Hints**: Explicit GC hints if Node.js is run with `--expose-gc`

**Result**: Database updates complete within 512MB memory limit on Render starter tier by never holding more than ~300 cards in memory at once.

### Monitoring & Verification

#### Check Cron Job Status on Render

1. Log into Render dashboard
2. Navigate to "Cron Jobs" section
3. Select `update-staging-db`
4. View "Logs" tab for execution history

#### Check Logs

Successful execution logs should show:

```
[info] Connecting to database: cluster.mongodb.net (name: MTGVersioner)
[info] Downloading bulk data from Scryfall...
[info] Downloading bulk data file (this may take a few minutes)...
[info] Processing 85000+ cards in batches of 500...
[info] Processing chunk 1/17 (cards 0-5000)...
[info] Bulk data update complete. Processed 85000 cards, inserted 85000 unique entries.
```

#### Verify Database Updates

Connect to MongoDB Atlas and check:

- Database size should be ~200MB
- Card count should match Scryfall's bulk data count (~85,000+ cards)
- Last modified timestamp should match cron execution time

### Manual Database Updates

#### Local Update (Against Remote Database)

```bash
# Update staging database
npm run pullBulkData:staging
```

**Note**: This command connects to remote MongoDB Atlas, so ensure your IP is whitelisted in MongoDB Atlas Network Access settings.

#### Via SSH into Render Environment

```bash
# SSH into staging (requires Render CLI or shell access)
# Then run:
npm run pullBulkData
```

### Troubleshooting

#### Cron Job Fails with Memory Error

- Verify `BATCH_SIZE` and `PROCESS_CHUNK_SIZE` in `tools/pullBulkData.js`
- Consider upgrading Render plan for more memory
- Check MongoDB Atlas connection timeout settings

#### Database Not Updating

1. Check Render cron job logs for errors
2. Verify MongoDB Atlas connection string is correct
3. Ensure Render IP is whitelisted in MongoDB Atlas
4. Check Scryfall API status (<https://scryfall.com/docs/api/bulk-data>)

#### Duplicate Cards in Database

- The script includes deduplication by `scryfall_id`
- If duplicates persist, clear collection and re-run update
- Check for race conditions if running updates manually during cron execution

### Deployment

To deploy or update cron job configuration:

1. Modify `deploy/render-cron.yaml` as needed
2. Commit changes to repository
3. Render automatically detects changes and updates cron jobs
4. Verify in Render dashboard that cron jobs are updated

### Best Practices

✅ **DO:**

- Monitor cron job logs weekly for failures
- Test database updates manually before relying on automation
- Set appropriate log level (`info` for staging)

❌ **DON'T:**

- Run manual updates while cron job is executing (can cause race conditions)
- Change schedules to run more than once daily (unnecessary load on Scryfall)
- Remove deduplication logic (prevents duplicate entries)
- Ignore memory optimization (will cause out-of-memory errors on free/starter tier)

---

## Directory Structure

```
deploy/
├── README.md           # This comprehensive deployment guide
├── render-cron.yaml    # Render cron job configuration (auto-deployed)
└── (future configs)    # Additional deployment configurations
```

---

## Additional Resources

- [Render Cron Jobs Documentation](https://render.com/docs/cronjobs)
- [Scryfall Bulk Data API](https://scryfall.com/docs/api/bulk-data)
- [MongoDB Atlas Setup Guide](https://docs.atlas.mongodb.com/)
- Main API README: `../README.md`
- Pull Bulk Data Script: `../tools/pullBulkData.js`

---

**Last Updated**: February 24, 2026
