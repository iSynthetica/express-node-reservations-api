import { Router } from 'express';
import type { MetricsReaderPort } from '../../shared/ports/metrics-reader.port';
import { createSystemController } from './system.controller';

interface SystemRouterDependencies {
  metricsReader: MetricsReaderPort;
}

export function createSystemRouter({ metricsReader }: SystemRouterDependencies): Router {
  const systemRouter = Router();
  const controller = createSystemController({ metricsReader });

  systemRouter.get('/', controller.rootHandler);
  systemRouter.get('/health', controller.healthHandler);
  systemRouter.get('/slow', controller.slowHandler);
  systemRouter.get('/metrics', controller.metricsHandler);
  systemRouter.get('/error', controller.errorTestHandler);

  return systemRouter;
}
