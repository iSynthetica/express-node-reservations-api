import { Router } from 'express';
import { createSystemController } from './system.controller';

export function createSystemRouter(): Router {
  const systemRouter = Router();
  const controller = createSystemController();

  systemRouter.get('/', controller.rootHandler);
  systemRouter.get('/health', controller.healthHandler);
  systemRouter.get('/slow', controller.slowHandler);
  systemRouter.get('/metrics', controller.metricsHandler);
  systemRouter.get('/error', controller.errorTestHandler);

  return systemRouter;
}
