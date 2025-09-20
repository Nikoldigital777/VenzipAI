import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { createModuleLogger, logError } from '../logger';

// Create module logger for validation
const validationLogger = createModuleLogger('validation');

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidatedRequest<
  TBody = any,
  TQuery = any,
  TParams = any
> extends Request {
  validatedBody: TBody;
  validatedQuery: TQuery;
  validatedParams: TParams;
}

/**
 * Generic validation middleware that validates request body, query, and params
 */
export function validateRequest<
  TBody = any,
  TQuery = any,
  TParams = any
>(schemas: {
  body?: ZodSchema<TBody>;
  query?: ZodSchema<TQuery>;
  params?: ZodSchema<TParams>;
}) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedReq = req as ValidatedRequest<TBody, TQuery, TParams>;

      // Validate body if schema provided
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          const validationErrors = formatZodErrors(bodyResult.error);
          
          // Log validation failure with context
          (req.logger || validationLogger).warn({
            category: 'validation',
            validationType: 'body',
            method: req.method,
            path: req.path,
            errors: validationErrors,
            requestBody: req.body
          }, 'Request body validation failed');

          return res.status(400).json({
            error: 'Validation failed',
            details: validationErrors,
            field: 'body'
          });
        }
        validatedReq.validatedBody = bodyResult.data;
      }

      // Validate query parameters if schema provided
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          const validationErrors = formatZodErrors(queryResult.error);
          
          // Log validation failure with context
          (req.logger || validationLogger).warn({
            category: 'validation',
            validationType: 'query',
            method: req.method,
            path: req.path,
            errors: validationErrors,
            query: req.query
          }, 'Request query validation failed');

          return res.status(400).json({
            error: 'Validation failed',
            details: validationErrors,
            field: 'query'
          });
        }
        validatedReq.validatedQuery = queryResult.data;
      }

      // Validate route parameters if schema provided
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          const validationErrors = formatZodErrors(paramsResult.error);
          
          // Log validation failure with context
          (req.logger || validationLogger).warn({
            category: 'validation',
            validationType: 'params',
            method: req.method,
            path: req.path,
            errors: validationErrors,
            params: req.params
          }, 'Request params validation failed');

          return res.status(400).json({
            error: 'Validation failed',
            details: validationErrors,
            field: 'params'
          });
        }
        validatedReq.validatedParams = paramsResult.data;
      }

      // Log successful validation
      (req.logger || validationLogger).debug({
        category: 'validation',
        method: req.method,
        path: req.path,
        validatedFields: {
          body: !!schemas.body,
          query: !!schemas.query,
          params: !!schemas.params
        }
      }, 'Request validation passed');

      next();
    } catch (error) {
      // Log validation middleware error with structured logging
      logError(req.logger || validationLogger, error, {
        category: 'validation',
        operation: 'middleware_execution',
        method: req.method,
        path: req.path,
        requestBody: req.body,
        query: req.query,
        params: req.params
      });

      res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
}

/**
 * Simplified validation for body only (most common case)
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return validateRequest({ body: schema });
}

/**
 * Simplified validation for query only
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return validateRequest({ query: schema });
}

/**
 * Simplified validation for params only
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return validateRequest({ params: schema });
}

/**
 * Format Zod validation errors into a more user-friendly format
 */
function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}