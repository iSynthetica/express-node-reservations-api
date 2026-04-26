import { ERROR_CODES, type ErrorCode } from './error-codes';

interface AppErrorOptions {
  cause?: unknown;
  code?: ErrorCode;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly isOperational: boolean;

  constructor(statusCode: number, message: string, options: AppErrorOptions = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options.code ?? ERROR_CODES.INTERNAL_ERROR;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
  }
}
