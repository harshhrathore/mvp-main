/**
 * Environment Variable Validation Module
 * 
 * This module validates required environment variables on startup
 * and provides clear error messages if variables are missing.
 * 
 * Requirements: 4.6 - Validate required environment variables before starting services
 */

interface ValidationResult {
  valid: boolean;
  missing: string[];
  errors: string[];
}

interface EnvConfig {
  required: string[];
  optional?: string[];
  validators?: Record<string, (value: string) => boolean>;
}

/**
 * Core required environment variables for the API Gateway
 */
const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

/**
 * Microservices-specific required variables
 */
const MICROSERVICES_REQUIRED_VARS = [
  'CHECKIN_CHAT_URL',
  'CHECKIN_VOICE_URL',
] as const;

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_VARS = [
  'NODE_ENV',
  'LOG_LEVEL',
  'PORT',
  'ALLOWED_ORIGINS',
  'API_GATEWAY_URL',
  'FRONTEND_URL',
] as const;

/**
 * Custom validators for specific environment variables
 */
const VALIDATORS: Record<string, (value: string) => boolean> = {
  DATABASE_URL: (value: string) => {
    return value.startsWith('postgresql://') || value.startsWith('postgres://');
  },
  JWT_SECRET: (value: string) => {
    return value.length >= 32;
  },
  CHECKIN_CHAT_URL: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  CHECKIN_VOICE_URL: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  PORT: (value: string) => {
    const port = Number(value);
    return !isNaN(port) && port > 0 && port <= 65535;
  },
};

/**
 * Validates a single environment variable
 */
function validateVariable(name: string, value: string | undefined): { valid: boolean; error?: string } {
  if (value === undefined || value === '') {
    return { valid: false, error: `${name} is not set` };
  }

  // Check custom validator if exists
  const validator = VALIDATORS[name];
  if (validator && !validator(value)) {
    return { valid: false, error: `${name} has invalid format or value` };
  }

  return { valid: true };
}

/**
 * Validates all required environment variables
 */
export function validateRequiredEnv(config?: EnvConfig): ValidationResult {
  const requiredVars = config?.required || [...REQUIRED_VARS, ...MICROSERVICES_REQUIRED_VARS];
  const missing: string[] = [];
  const errors: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    const result = validateVariable(varName, value);

    if (!result.valid) {
      missing.push(varName);
      if (result.error) {
        errors.push(result.error);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    errors,
  };
}

/**
 * Validates environment variables and throws if validation fails
 * This should be called at application startup
 */
export function ensureValidEnv(config?: EnvConfig): void {
  const result = validateRequiredEnv(config);

  if (!result.valid) {
    const errorMessage = [
      '╔════════════════════════════════════════════════════════════════╗',
      '║  ENVIRONMENT CONFIGURATION ERROR                               ║',
      '╚════════════════════════════════════════════════════════════════╝',
      '',
      '❌ Missing or invalid required environment variables:',
      '',
      ...result.errors.map(err => `   • ${err}`),
      '',
      '📋 Required variables:',
      ...result.missing.map(v => `   • ${v}`),
      '',
      '💡 To fix this:',
      '   1. Copy .env.example to .env',
      '   2. Fill in all required values',
      '   3. Restart the application',
      '',
      '📖 For more information, see the documentation:',
      '   - .env.example for variable descriptions',
      '   - README.md for setup instructions',
      '',
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Validates environment-specific configuration
 * Ensures development/production environments have appropriate settings
 */
export function validateEnvironmentMode(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const validEnvs = ['development', 'production', 'test'];

  if (!validEnvs.includes(nodeEnv)) {
    console.warn(
      `⚠️  Warning: NODE_ENV="${nodeEnv}" is not a standard value.\n` +
      `   Expected: ${validEnvs.join(', ')}\n` +
      `   Defaulting to "development" mode.`
    );
  }

  // Production-specific validations
  if (nodeEnv === 'production') {
    const productionWarnings: string[] = [];

    // Check JWT secret is not default
    if (process.env.JWT_SECRET?.includes('your_') || process.env.JWT_SECRET?.includes('change_')) {
      productionWarnings.push('JWT_SECRET appears to be a placeholder value');
    }

    // Check database URL is not localhost
    if (process.env.DATABASE_URL?.includes('localhost')) {
      productionWarnings.push('DATABASE_URL points to localhost in production');
    }

    // Check service URLs are HTTPS
    if (process.env.CHECKIN_CHAT_URL && !process.env.CHECKIN_CHAT_URL.startsWith('https://')) {
      productionWarnings.push('CHECKIN_CHAT_URL should use HTTPS in production');
    }

    if (process.env.CHECKIN_VOICE_URL && !process.env.CHECKIN_VOICE_URL.startsWith('https://')) {
      productionWarnings.push('CHECKIN_VOICE_URL should use HTTPS in production');
    }

    if (productionWarnings.length > 0) {
      console.warn(
        '\n⚠️  Production Environment Warnings:\n' +
        productionWarnings.map(w => `   • ${w}`).join('\n') +
        '\n'
      );
    }
  }
}

/**
 * Prints environment configuration summary (safe for logging)
 * Masks sensitive values
 */
export function printEnvSummary(): void {
  const maskValue = (value: string | undefined, showLength = 4): string => {
    if (!value) return '<not set>';
    if (value.length <= showLength) return '***';
    return value.substring(0, showLength) + '***';
  };

  const nodeEnv = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || 'info';

  console.log('\n📋 Environment Configuration:');
  console.log(`   Environment: ${nodeEnv}`);
  console.log(`   Log Level: ${logLevel}`);
  console.log(`   Port: ${process.env.PORT || 5000}`);
  console.log(`   Database: ${maskValue(process.env.DATABASE_URL, 10)}`);
  console.log(`   JWT Secret: ${maskValue(process.env.JWT_SECRET)}`);
  console.log(`   Checkin Chat URL: ${process.env.CHECKIN_CHAT_URL || '<not set>'}`);
  console.log(`   Checkin Voice URL: ${process.env.CHECKIN_VOICE_URL || '<not set>'}`);
  console.log('');
}

/**
 * Main validation function to be called at application startup
 * Validates all environment variables and prints summary
 */
export function validateEnv(): void {
  try {
    // Validate required variables
    ensureValidEnv();

    // Validate environment mode
    validateEnvironmentMode();

    // Print summary (only in development)
    if (process.env.NODE_ENV !== 'production') {
      printEnvSummary();
    }

    console.log('✅ Environment validation passed\n');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
