#!/usr/bin/env node

/**
 * Orchestration Script with Graceful Shutdown
 * Manages the lifecycle of all microservices with proper signal handling
 */

const { spawn } = require('child_process');
const path = require('path');

// Service configurations
const SERVICES = [
  {
    name: 'checkin-chat',
    command: 'python',
    args: ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
    cwd: path.resolve(__dirname, '../../checkin-chat/files'),
    color: '\x1b[36m', // Cyan
    env: { PORT: '8000' }
  },
  {
    name: 'checkin-voice',
    command: 'python',
    args: ['api_server.py'],
    cwd: path.resolve(__dirname, '../../checkin-voice/sama-voice-agentcode/local-voice-ai-agent'),
    color: '\x1b[35m', // Magenta
    env: { PORT: '8001' }
  },
  {
    name: 'backend',
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.resolve(__dirname, '..'),
    color: '\x1b[32m', // Green
    env: {}
  },
  {
    name: 'frontend',
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.resolve(__dirname, '../../frontend'),
    color: '\x1b[34m', // Blue
    env: {}
  }
];

const RESET_COLOR = '\x1b[0m';

// Track running processes
const runningProcesses = new Map();
let isShuttingDown = false;

/**
 * Format log message with service name and color
 */
function formatLog(serviceName, message, color) {
  const timestamp = new Date().toISOString();
  return `${color}[${timestamp}] [${serviceName}]${RESET_COLOR} ${message}`;
}

/**
 * Start a service process
 */
function startService(service) {
  return new Promise((resolve, reject) => {
    console.log(formatLog(service.name, `Starting...`, service.color));

    const env = {
      ...process.env,
      ...service.env,
      FORCE_COLOR: '1' // Enable colors in child processes
    };

    const childProcess = spawn(service.command, service.args, {
      cwd: service.cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    // Store process reference
    runningProcesses.set(service.name, childProcess);

    // Handle stdout
    childProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(formatLog(service.name, line, service.color));
      });
    });

    // Handle stderr
    childProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.error(formatLog(service.name, `ERROR: ${line}`, service.color));
      });
    });

    // Handle process exit
    childProcess.on('exit', (code, signal) => {
      runningProcesses.delete(service.name);
      
      if (!isShuttingDown) {
        if (code !== 0 && code !== null) {
          console.error(formatLog(service.name, `Exited with code ${code}`, service.color));
          reject(new Error(`${service.name} exited with code ${code}`));
        } else if (signal) {
          console.log(formatLog(service.name, `Terminated by signal ${signal}`, service.color));
        } else {
          console.log(formatLog(service.name, `Stopped`, service.color));
        }
      }
    });

    // Handle process errors
    childProcess.on('error', (err) => {
      console.error(formatLog(service.name, `Failed to start: ${err.message}`, service.color));
      runningProcesses.delete(service.name);
      reject(err);
    });

    // Give the process a moment to start
    setTimeout(() => {
      if (runningProcesses.has(service.name)) {
        console.log(formatLog(service.name, `Started successfully`, service.color));
        resolve();
      }
    }, 1000);
  });
}

/**
 * Stop a service process
 */
function stopService(serviceName) {
  return new Promise((resolve) => {
    const childProcess = runningProcesses.get(serviceName);
    
    if (!childProcess) {
      resolve();
      return;
    }

    const service = SERVICES.find(s => s.name === serviceName);
    console.log(formatLog(serviceName, `Stopping...`, service?.color || RESET_COLOR));

    // Set a timeout for forceful termination
    const forceKillTimeout = setTimeout(() => {
      if (runningProcesses.has(serviceName)) {
        console.log(formatLog(serviceName, `Force killing...`, service?.color || RESET_COLOR));
        childProcess.kill('SIGKILL');
      }
    }, 5000);

    // Listen for process exit
    childProcess.once('exit', () => {
      clearTimeout(forceKillTimeout);
      runningProcesses.delete(serviceName);
      console.log(formatLog(serviceName, `Stopped`, service?.color || RESET_COLOR));
      resolve();
    });

    // Send termination signal
    if (process.platform === 'win32') {
      // Windows doesn't support SIGTERM, use taskkill
      spawn('taskkill', ['/pid', childProcess.pid, '/f', '/t'], { shell: true });
    } else {
      childProcess.kill('SIGTERM');
    }
  });
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`\n\n${RESET_COLOR}Received ${signal}, shutting down gracefully...${RESET_COLOR}\n`);

  // Stop all services in reverse order
  const serviceNames = Array.from(runningProcesses.keys()).reverse();
  
  for (const serviceName of serviceNames) {
    await stopService(serviceName);
  }

  console.log(`\n${RESET_COLOR}All services stopped. Goodbye!${RESET_COLOR}\n`);
  process.exit(0);
}

/**
 * Start all services
 */
async function startAllServices() {
  console.log(`\n${RESET_COLOR}=== Starting Sama Wellness Microservices ===${RESET_COLOR}\n`);

  try {
    // Start services sequentially to avoid overwhelming the system
    for (const service of SERVICES) {
      await startService(service);
      // Small delay between service starts
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n${RESET_COLOR}=== All services started ===${RESET_COLOR}\n`);
    console.log(`${RESET_COLOR}Services running:`);
    console.log(`  - Checkin Chat: http://localhost:8000`);
    console.log(`  - Checkin Voice: http://localhost:8001`);
    console.log(`  - API Gateway: http://localhost:5000`);
    console.log(`  - Frontend: http://localhost:5173`);
    console.log(`\nPress Ctrl+C to stop all services\n${RESET_COLOR}`);

  } catch (err) {
    console.error(`\n${RESET_COLOR}Failed to start services: ${err.message}${RESET_COLOR}\n`);
    await gracefulShutdown('ERROR');
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  // Register signal handlers for graceful shutdown
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  
  // Windows-specific: Handle Ctrl+C and Ctrl+Break
  if (process.platform === 'win32') {
    // Readline is used to keep the process alive and handle Ctrl+C
    const readline = require('readline');
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`\n${RESET_COLOR}Uncaught exception: ${err.message}${RESET_COLOR}\n`);
    gracefulShutdown('EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error(`\n${RESET_COLOR}Unhandled rejection at: ${promise}, reason: ${reason}${RESET_COLOR}\n`);
    gracefulShutdown('REJECTION');
  });

  // Start all services
  await startAllServices();
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { startService, stopService, gracefulShutdown };
