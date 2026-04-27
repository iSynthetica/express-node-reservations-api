import express from 'express';
import { createDependencies, type DependencyOverrides } from '../bootstrap/dependencies';
import { type DataBootstrapResult } from './bootstrap-data';
import { registerCoreMiddleware } from '../bootstrap/register-core-middleware';
import { registerErrorHandling } from '../bootstrap/register-error-handling';
import { registerRoutes } from '../bootstrap/register-routes';

export function createApp(data: DataBootstrapResult, overrides: DependencyOverrides = {}) {
  const app = express();
  const deps = createDependencies(data, overrides);

  registerCoreMiddleware(app);
  registerRoutes(app, deps);
  registerErrorHandling(app, deps);

  return app;
}
