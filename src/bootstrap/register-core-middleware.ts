import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from '../app/cors';
import { httpLogger } from '../api/middleware/http-logger.middleware';
import { httpMetricsMiddleware } from '../api/middleware/metrics.middleware';
import { apiRateLimit } from '../app/rate-limit';

export function registerCoreMiddleware(app: Express): void {
  app.use(httpLogger);
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(httpMetricsMiddleware);
  app.use(apiRateLimit);
}
