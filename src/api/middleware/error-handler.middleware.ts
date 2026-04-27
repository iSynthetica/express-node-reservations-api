import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors/app.error';
import { ERROR_CODES } from '../../shared/errors/error-codes';
import type { LoggerPort } from '../../shared/ports/logger.port';

interface ErrorHandlerDependencies {
  logger: LoggerPort;
  isProduction: boolean;
}

function isLoggerPort(value: unknown): value is LoggerPort {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as {
    debug?: unknown;
    info?: unknown;
    error?: unknown;
    warn?: unknown;
  };

  return (
    typeof candidate.debug === 'function' &&
    typeof candidate.info === 'function' &&
    typeof candidate.error === 'function' &&
    typeof candidate.warn === 'function'
  );
}

function getRequestLogger(req: Request, fallbackLogger: LoggerPort): LoggerPort {
  const requestLogger = (req as Request & { log?: unknown }).log;

  if (isLoggerPort(requestLogger)) {
    return requestLogger;
  }

  return fallbackLogger;
}

function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createErrorHandler({
  logger,
  isProduction,
}: ErrorHandlerDependencies): ErrorRequestHandler {
  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestLogger = getRequestLogger(req, logger);

    if (isAppError(err)) {
      const logMethod =
        err.statusCode >= 500
          ? requestLogger.error.bind(requestLogger)
          : requestLogger.warn.bind(requestLogger);

      logMethod(
        {
          err,
          requestId: req.id,
          method: req.method,
          url: req.url,
          code: err.code,
          statusCode: err.statusCode,
        },
        'Handled application error',
      );

      const responseBody: {
        message: string;
        code: string;
        details?: unknown;
      } = {
        message: err.message,
        code: err.code,
      };

      if (!isProduction && err.details !== undefined) {
        responseBody.details = err.details;
      }

      res.status(err.statusCode).json(responseBody);
      return;
    }

    requestLogger.error(
      {
        err,
        requestId: req.id,
        method: req.method,
        url: req.url,
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      'Unhandled error',
    );

    res.status(500).json({
      message: 'Internal server error',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  };
}
