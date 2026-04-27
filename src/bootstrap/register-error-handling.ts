import type { Express } from 'express';
import { env } from '../app/env';
import { createErrorHandler } from '../app/http/middleware/error-handler.middleware';
import { notFoundHandler } from '../app/http/middleware/not-found-handler.middleware';
import type { AppContainer } from '../app/container';

export function registerErrorHandling(app: Express, container: AppContainer): void {
  const errorHandler = createErrorHandler({
    logger: container.dependencies.logger,
    isProduction: env.NODE_ENV === 'production',
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
}
