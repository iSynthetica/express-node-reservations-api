import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './cors';
import { httpLogger } from './http-logger';
import { httpMetricsMiddleware } from './http-metrics';
import { apiRateLimit } from './rate-limit';
import { env } from './env';
import { createErrorHandler } from './http/middleware/error-handler.middleware';
import { notFoundHandler } from './http/middleware/not-found-handler.middleware';
import { createAppContainer } from './container';
import { type DataBootstrapResult } from './bootstrap-data';

export function createApp(data: DataBootstrapResult) {
  const app = express();
  const container = createAppContainer(data);

  const errorHandler = createErrorHandler({
    logger: container.dependencies.logger,
    isProduction: env.NODE_ENV === 'production',
  });

  app.use(httpLogger);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(apiRateLimit);

  app.use(httpMetricsMiddleware);

  app.use(container.routers.systemRouter);
  app.use('/api/v1', container.routers.reservationsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
