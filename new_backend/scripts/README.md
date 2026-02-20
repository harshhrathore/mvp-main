# Orchestration Scripts

This directory contains scripts for managing the Sama Wellness microservices architecture.

## Scripts

### orchestrate.js

The main orchestration script that manages the lifecycle of all microservices with graceful shutdown handling.

**Features:**
- Starts all services in the correct order
- Handles SIGINT (Ctrl+C) and SIGTERM signals gracefully
- Terminates all child processes on shutdown
- Provides colored console output for each service
- Windows-compatible process management

**Usage:**

From the workspace root (where package-root.json is located):
```bash
npm run dev
```

Or directly:
```bash
node new_backend/scripts/orchestrate.js
```

**Services Started:**
1. Checkin Chat Service (port 8000)
2. Checkin Voice Service (port 8001)
3. API Gateway / Backend (port 5000)
4. Frontend (port 5173)

**Stopping Services:**
Press `Ctrl+C` to gracefully shut down all services. The script will:
1. Catch the SIGINT signal
2. Stop all services in reverse order
3. Wait for each service to terminate (max 5 seconds)
4. Force kill any services that don't stop gracefully
5. Exit cleanly

### health-check.js

A utility script for checking the health of individual services or all services at once.

**Features:**
- Polls service health endpoints with retry logic
- Exponential backoff (1s, 2s, 4s)
- Maximum 3 retry attempts by default
- Returns appropriate exit codes for orchestration

**Usage:**

Check a single service:
```bash
node new_backend/scripts/health-check.js "Service Name" http://localhost:PORT/health [max-retries]
```

Example:
```bash
node new_backend/scripts/health-check.js backend http://localhost:5000/health 3
```

Check all services:
```bash
npm run health-check:all
```

Or directly:
```bash
node new_backend/scripts/health-check.js --all
```

**Exit Codes:**
- `0`: Service(s) healthy
- `1`: Service(s) unhealthy or error occurred

## Environment Variables

The orchestration scripts respect the following environment variables:

- `PORT`: Port number for services (service-specific)
- `CHECKIN_CHAT_URL`: URL for checkin-chat service health check (default: http://localhost:8000/health)
- `CHECKIN_VOICE_URL`: URL for checkin-voice service health check (default: http://localhost:8001/health)
- `API_GATEWAY_URL`: URL for API gateway health check (default: http://localhost:5000/health)
- `FRONTEND_URL`: URL for frontend (default: http://localhost:5173)

## Windows Compatibility

All scripts are designed to work on Windows with cmd shell:

- Uses Windows-compatible path separators
- Uses `taskkill` for process termination on Windows
- Handles Windows-specific signal limitations
- Uses `.cmd` extension for npm commands on Windows

## Troubleshooting

### Services won't start

1. Check that all dependencies are installed:
   ```bash
   npm run install:all
   ```

2. Verify ports are not already in use:
   ```bash
   netstat -ano | findstr :8000
   netstat -ano | findstr :8001
   netstat -ano | findstr :5000
   netstat -ano | findstr :5173
   ```

3. Check service logs in the console output

### Services won't stop gracefully

If services don't stop after pressing Ctrl+C:

1. Wait up to 5 seconds for force kill
2. Manually kill processes if needed:
   ```bash
   taskkill /F /IM node.exe
   taskkill /F /IM python.exe
   ```

### Health checks failing

1. Verify services are actually running
2. Check that health endpoints are accessible:
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8001/health
   curl http://localhost:5000/health
   ```

3. Check database connectivity (services require database to be healthy)

## Development

### Running Individual Services

You can also run services individually for development:

**Backend only:**
```bash
cd new_backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

**Checkin Chat only:**
```bash
cd checkin-chat/files
python -m uvicorn app.main:app --reload --port 8000
```

**Checkin Voice only:**
```bash
cd checkin-voice/sama-voice-agentcode/local-voice-ai-agent
python api_server.py
```

### Testing

Run orchestration tests:
```bash
cd new_backend
npm test orchestration.test.ts
```

## Architecture

```
orchestrate.js
├── Starts checkin-chat (Python/FastAPI)
├── Starts checkin-voice (Python/FastAPI)
├── Starts backend (Node.js/Express)
└── Starts frontend (React/Vite)

On SIGINT/SIGTERM:
├── Stops frontend
├── Stops backend
├── Stops checkin-voice
└── Stops checkin-chat
```

## Future Enhancements

- [ ] Add health check polling during startup
- [ ] Add service dependency verification
- [ ] Add automatic restart on service crash
- [ ] Add log aggregation and filtering
- [ ] Add performance monitoring
- [ ] Add Docker Compose alternative
