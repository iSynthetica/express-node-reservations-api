import type { Express } from 'express';
import { env } from '../app/env';
import { createErrorHandler } from '../app/http/middleware/error-handler.middleware';
import { notFoundHandler } from '../app/http/middleware/not-found-handler.middleware';
import type { AppDependencies } from './dependencies';

export function registerErrorHandling(app: Express, deps: AppDependencies): void {
  const errorHandler = createErrorHandler({
    logger: deps.logger,
    isProduction: env.NODE_ENV === 'production',
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
}
