# ══════════════════════════════════════════════════════════════
# SAMA WELLNESS - FRONTEND DOCKERFILE
# ══════════════════════════════════════════════════════════════
# React + Vite web application
# ══════════════════════════════════════════════════════════════

# ─── Stage 1: Build ───────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install serve for production or vite for development
RUN npm install -g serve vite

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/index.html ./

# Copy source for development hot-reload
COPY src ./src
COPY public ./public

# Install production dependencies
RUN npm ci --only=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Start the application
# Use vite dev server for development, serve for production
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then serve -s dist -l 5173; else npm run dev -- --host 0.0.0.0; fi"]
