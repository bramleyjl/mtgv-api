#!/bin/sh

# Exit on any error
set -e

echo "Starting MTGV API startup sequence..."

# Database update removed temporarily due to memory constraints
# TODO: Re-implement with memory optimization in post-MVP
echo "Database update disabled - will be handled by cron job"

echo "Starting server..."
exec node src/server.js
