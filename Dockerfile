# Use a specific Node.js LTS version on Alpine for a small, secure base
FROM node:23.5.0-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
# Chown is important for the non-root user to have permissions
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the code
COPY --chown=appuser:appgroup . .

# Switch to the non-root user
USER appuser

# Expose the port your app runs on (from .env)
EXPOSE 4000

# Make the startup script executable
RUN chmod +x scripts/start.sh

# Use the startup script instead of starting the server directly
CMD ["./scripts/start.sh"]
