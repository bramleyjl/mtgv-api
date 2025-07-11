#!/bin/bash

# Script to find and kill MTGV API Docker containers
echo "🔍 Finding MTGV API Docker containers..."

# Find running containers with mtgv-api image
RUNNING_CONTAINERS=$(sudo docker ps -q --filter ancestor=mtgv-api)

if [ -n "$RUNNING_CONTAINERS" ]; then
    echo "🛑 Stopping running containers:"
    echo "$RUNNING_CONTAINERS"
    echo "$RUNNING_CONTAINERS" | xargs -r sudo docker stop
    echo "✅ Containers stopped successfully"
else
    echo "ℹ️  No running MTGV API containers found"
fi

# Find all containers (including stopped) with mtgv-api image
ALL_CONTAINERS=$(sudo docker ps -a -q --filter ancestor=mtgv-api)

if [ -n "$ALL_CONTAINERS" ]; then
    echo "🗑️  Removing containers:"
    echo "$ALL_CONTAINERS"
    echo "$ALL_CONTAINERS" | xargs -r sudo docker rm
    echo "✅ Containers removed successfully"
else
    echo "ℹ️  No MTGV API containers found to remove"
fi

echo "🎉 Docker cleanup complete!" 