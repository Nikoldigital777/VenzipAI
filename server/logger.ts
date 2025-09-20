import pino from 'pino';
import type { Logger } from 'pino';

// Define log levels and their numeric values
const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10
} as const;

// Get log level from environment or default to 'info'
const getLogLevel = (): keyof typeof LOG_LEVELS => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as keyof typeof LOG_LEVELS;
  }
  return process.env.NODE_ENV === 'development' ? 'debug' : 'info';
};

// Base logger configuration
const baseConfig = {
  level: getLogLevel(),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  base: {
    service: 'venzip-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'local',
  },
};

// Development configuration with pretty printing
const developmentConfig = {
  ...baseConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname,service,version,environment',
      messageFormat: '{service}[{module}] {msg}',
      singleLine: false,
    },
  },
};

// Production configuration with JSON output
const productionConfig = {
  ...baseConfig,
};

// Create the main logger instance
export const logger: Logger = pino(
  process.env.NODE_ENV === 'development' ? developmentConfig : productionConfig
);

// Create child logger with module context
export const createModuleLogger = (module: string): Logger => {
  return logger.child({ module });
};

// Helper function to create request-scoped logger
export const createRequestLogger = (requestId: string, userId?: string, companyId?: string): Logger => {
  return logger.child({
    requestId,
    userId,
    companyId,
  });
};

// Performance measurement helper
export const withTiming = async <T>(
  log: Logger,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = process.hrtime.bigint();
  
  try {
    log.debug({ operation }, `Starting ${operation}`);
    const result = await fn();
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000; // Convert to milliseconds
    
    log.info({ operation, duration }, `Completed ${operation}`);
    return result;
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
    log.error({ operation, duration, error }, `Failed ${operation}`);
    throw error;
  }
};

// Error logging helper with structured data
export const logError = (
  log: Logger, 
  error: Error | unknown, 
  context: Record<string, any> = {}
): void => {
  if (error instanceof Error) {
    log.error({
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        type: error.constructor.name,
      }
    }, `Error occurred: ${error.message}`);
  } else {
    log.error({
      ...context,
      error: { message: String(error) }
    }, `Unknown error occurred: ${String(error)}`);
  }
};

// Authentication event logging helper
export const logAuthEvent = (
  log: Logger,
  action: string,
  userId?: string,
  metadata: Record<string, any> = {}
): void => {
  log.info({
    action,
    userId,
    category: 'authentication',
    ...metadata
  }, `Authentication event: ${action}`);
};

// Database operation logging helper
export const logDatabaseOperation = (
  log: Logger,
  operation: string,
  table?: string,
  duration?: number,
  metadata: Record<string, any> = {}
): void => {
  log.debug({
    category: 'database',
    operation,
    table,
    duration,
    ...metadata
  }, `Database operation: ${operation}${table ? ` on ${table}` : ''}`);
};

// AI interaction logging helper
export const logAIInteraction = (
  log: Logger,
  action: string,
  model: string,
  duration?: number,
  metadata: Record<string, any> = {}
): void => {
  log.info({
    category: 'ai_interaction',
    action,
    model,
    duration,
    ...metadata
  }, `AI interaction: ${action}`);
};

// Business event logging helper
export const logBusinessEvent = (
  log: Logger,
  action: string,
  userId?: string,
  companyId?: string,
  metadata: Record<string, any> = {}
): void => {
  log.info({
    category: 'business',
    action,
    userId,
    companyId,
    ...metadata
  }, `Business event: ${action}`);
};

// Export the main logger as default
export default logger;