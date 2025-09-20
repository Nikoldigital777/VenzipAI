import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { createRequestLogger, logError } from '../logger';
import type { Logger } from 'pino';

// Extend Express Request interface to include logger and correlation data
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      logger: Logger;
      startTime: bigint;
    }
  }
}

// Extract user context from authenticated request
const extractUserContext = (req: Request): { userId?: string; companyId?: string } => {
  const user = req.user as any;
  return {
    userId: user?.sub || user?.claims?.sub,
    companyId: undefined, // We'll enhance this later when we have company context
  };
};

// Extract meaningful request metadata
const extractRequestMetadata = (req: Request) => {
  return {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection.remoteAddress,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  };
};

// Determine if request should be logged based on path
const shouldLogRequest = (path: string): boolean => {
  // Skip health checks and static assets
  const skipPaths = ['/health', '/api/health', '/favicon.ico'];
  const skipPatterns = [/\/assets\//, /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/];
  
  if (skipPaths.includes(path)) return false;
  if (skipPatterns.some(pattern => pattern.test(path))) return false;
  
  return true;
};

// Main request logging middleware
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  req.requestId = randomUUID();
  req.startTime = process.hrtime.bigint();

  // Extract user context
  const { userId, companyId } = extractUserContext(req);

  // Create request-scoped logger
  req.logger = createRequestLogger(req.requestId, userId, companyId);

  // Log incoming request if it should be logged
  if (shouldLogRequest(req.path)) {
    const requestMetadata = extractRequestMetadata(req);
    
    req.logger.info({
      category: 'http_request',
      direction: 'incoming',
      ...requestMetadata,
    }, `${req.method} ${req.path}`);
  }

  // Capture original res.json to log response
  const originalJson = res.json;
  let responseBody: any;

  res.json = function(body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Log response when request finishes
  res.on('finish', () => {
    if (!shouldLogRequest(req.path)) return;

    const duration = Number(process.hrtime.bigint() - req.startTime) / 1_000_000; // Convert to milliseconds
    const responseMetadata = {
      statusCode: res.statusCode,
      duration,
      responseSize: res.get('Content-Length'),
    };

    // Log response with appropriate level based on status code
    const logLevel = res.statusCode >= 500 ? 'error' : 
                    res.statusCode >= 400 ? 'warn' : 'info';

    const logData: any = {
      category: 'http_response',
      direction: 'outgoing',
      ...responseMetadata,
    };

    // Include error response body for debugging
    if (res.statusCode >= 400 && responseBody) {
      logData.responseBody = responseBody;
    }

    req.logger[logLevel](logData, `${req.method} ${req.path} ${res.statusCode}`);
  });

  // Handle request errors
  res.on('error', (error) => {
    logError(req.logger, error, {
      category: 'http_error',
      method: req.method,
      path: req.path,
    });
  });

  next();
};

// Error handling middleware with structured logging
export const errorLoggerMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Use request logger if available, otherwise use a temporary one
  const logger = req.logger || createRequestLogger(req.requestId || 'unknown');

  logError(logger, error, {
    category: 'application_error',
    method: req.method,
    path: req.path,
    statusCode: error.status || error.statusCode || 500,
  });

  // Continue to default error handler
  next(error);
};

// Performance logging middleware for long-running operations
export const performanceLoggerMiddleware = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      const duration = Number(process.hrtime.bigint() - req.startTime) / 1_000_000;
      
      if (duration > threshold) {
        req.logger.warn({
          category: 'performance',
          duration,
          threshold,
          method: req.method,
          path: req.path,
        }, `Slow request detected: ${duration}ms > ${threshold}ms`);
      }
    });
    
    next();
  };
};