import type { Express } from 'express';
import type { AppDependencies } from './dependencies';

export function registerRoutes(app: Express, deps: AppDependencies): void {
  app.use(deps.systemRouter);
  app.use('/api/v1', deps.reservationsRouter);
  app.use('/api/v1', deps.csvRouter);
  app.use('/api/v1', deps.authRouter);
}
