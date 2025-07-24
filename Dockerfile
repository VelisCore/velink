# 🐳 Docker Configuration for Velink

FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
FROM base AS dependencies
RUN npm ci --only=production --silent
RUN cd server && npm ci --only=production --silent
RUN cd client && npm ci --silent

# Build client
FROM dependencies AS build
COPY client ./client
RUN cd client && npm run build

# Production image
FROM node:20-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S velink -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache sqlite curl

# Copy built application
COPY --from=dependencies --chown=velink:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=velink:nodejs /app/server/node_modules ./server/node_modules
COPY --from=build --chown=velink:nodejs /app/client/build ./client/build
COPY --chown=velink:nodejs server ./server
COPY --chown=velink:nodejs package*.json ./

# Create necessary directories
RUN mkdir -p /app/server/logs && chown velink:nodejs /app/server/logs
RUN mkdir -p /app/data && chown velink:nodejs /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80
ENV DATABASE_PATH=/app/data/velink.db

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/api/health || exit 1

# Switch to app user
USER velink

# Start the application
CMD ["npm", "run", "start:docker"]
