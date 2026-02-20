\\Production Dockerfile

# ─── Stage 1: Build 
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript → JavaScript
RUN npm run build

# ─── Stage 2: Production 
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start the app
CMD ["node", "dist/index.js"]

───────────────────────────────────────────────────────────────
FILE PATH: docker-compose.yml
LOCATION: Project root
───────────────────────────────────────────────────────────────

#Docker Compose file for Samaa application (PostgreSQL + Backend API)

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: samaa-postgres
    environment:
      POSTGRES_DB: samaa_dev
      POSTGRES_USER: samaa
      POSTGRES_PASSWORD: samaa_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U samaa"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: samaa-api
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: development
      PORT: 5000
      DATABASE_URL: postgresql://samaa:samaa_dev_password@postgres:5432/samaa_dev
      JWT_SECRET: ${JWT_SECRET:-dev_secret_change_in_production_32_chars}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ELEVENLABS_API_KEY: ${ELEVENLABS_API_KEY}
      ELEVENLABS_VOICE_ID: ${ELEVENLABS_VOICE_ID}
      BERT_API_URL: ${BERT_API_URL}
      BERT_API_KEY: ${BERT_API_KEY}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    ports:
      - "5000:5000"
    volumes:
      - ./src:/app/src
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:

───────────────────────────────────────────────────────────────
FILE PATH: .dockerignore
LOCATION: Project root
───────────────────────────────────────────────────────────────

node_modules
npm-debug.log
dist
.env
.env.example
.git
.gitignore
README.md
*.md
.DS_Store
.vscode
.idea
*.log
coverage
.nyc_output
*.test.ts
*.spec.ts
tests/