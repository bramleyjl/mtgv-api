#!/bin/sh

# Exit on any error
set -e

echo "Starting MTGV API startup sequence..."

# Check if we should run database update
if [ "$NODE_ENV" = "staging" ] || [ "$NODE_ENV" = "production" ]; then
    echo "Running database update for $NODE_ENV environment..."
    
    # Run the database update in the background
    # We'll wait a bit for it to start, then continue
    npm run pullBulkData &
    DB_UPDATE_PID=$!
    
    # Wait a bit for the update to start, but don't block forever
    sleep 10
    
    # Check if the update process is still running
    if kill -0 $DB_UPDATE_PID 2>/dev/null; then
        echo "Database update is running in background, continuing with server startup..."
        # Don't wait for it to finish - let it run in background
    else
        echo "Database update completed or failed, continuing with server startup..."
    fi
else
    echo "Skipping database update for $NODE_ENV environment"
fi

echo "Starting server..."
exec node src/server.js
