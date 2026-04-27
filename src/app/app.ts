import express from 'express';
import { createDependencies } from '../bootstrap/dependencies';
import { type DataBootstrapResult } from './bootstrap-data';
import { registerCoreMiddleware } from '../bootstrap/register-core-middleware';
import { registerErrorHandling } from '../bootstrap/register-error-handling';
import { registerRoutes } from '../bootstrap/register-routes';

export function createApp(data: DataBootstrapResult) {
  const app = express();
  const deps = createDependencies(data);

  registerCoreMiddleware(app);
  registerRoutes(app, deps);
  registerErrorHandling(app, deps);

  return app;
}
