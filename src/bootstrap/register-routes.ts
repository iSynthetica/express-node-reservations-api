import type { Express } from 'express';
import type { AppContainer } from '../app/container';

export function registerRoutes(app: Express, container: AppContainer): void {
  app.use(container.routers.systemRouter);
  app.use('/api/v1', container.routers.reservationsRouter);
  app.use('/api/v1', container.routers.csvRouter);
  app.use('/api/v1', container.routers.authRouter);
}
