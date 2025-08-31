# Deployment Configuration

This directory contains deployment-specific configurations for different environments.

## Cron Jobs

### `render-cron.yaml`
- **Purpose**: Automated daily database updates for staging/production
- **Schedule**: Daily at midnight UTC
- **Command**: Updates MongoDB Atlas with latest Scryfall data
- **Deployment**: Commit this file to trigger Render cron job creation

## SSH Access

### Easy SSH Commands
```bash
# SSH into staging environment
npm run ssh:staging

# SSH into production environment (when set up)
npm run ssh:production
```

### Environment Variables Required
Add these to your `.env` file:
```bash
STAGING_SSH_URL=srv-d1av506uk2gs7396rok0@ssh.oregon.render.com
PROD_SSH_URL=your_production_ssh_url_here
```

### Manual Database Updates
Once SSH'd into staging/production:
```bash
# Update staging database
npm run pullBulkData:staging

# Update production database (when ready)
npm run pullBulkData:production
```

## Directory Structure
```
deploy/
├── README.md           # This file
├── render-cron.yaml    # Render cron job configuration
└── (future configs)    # Other deployment configs
```

## Notes
- Cron jobs automatically run daily at midnight UTC
- SSH commands require proper environment variables
- Database updates can be run manually via SSH when needed
- All configurations use environment-specific settings
