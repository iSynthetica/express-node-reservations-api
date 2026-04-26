import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './cors';
import { httpLogger } from './http-logger';
import { httpMetricsMiddleware } from './http-metrics';
import { apiRateLimit } from './rate-limit';
import { appMetricsReader } from './metrics-reader.adapter';
import { env } from './env';
import { logger } from './logger';
import { createErrorHandler } from './http/middleware/error-handler.middleware';
import { notFoundHandler } from './http/middleware/not-found-handler.middleware';
import { createSystemModuleRouter } from '../modules/system';
import { createReservationsModuleRouter } from '../modules/reservations';
import type { DataBootstrapResult } from './bootstrap-data';

export function createApp(data: DataBootstrapResult) {
  const app = express();
  const systemRouter = createSystemModuleRouter({
    metricsReader: appMetricsReader,
  });

  const errorHandler = createErrorHandler({
    logger,
    isProduction: env.NODE_ENV === 'production',
  });

  app.use(httpLogger);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(apiRateLimit);

  app.use(httpMetricsMiddleware);

  app.use(systemRouter);
  app.use(
    '/api/v1',
    createReservationsModuleRouter({
      amenitiesRepo: data.amenitiesRepo,
      reservationsRepo: data.reservationsRepo,
    }),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
