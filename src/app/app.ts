import express from 'express';
import { createAppContainer } from './container';
import { type DataBootstrapResult } from './bootstrap-data';
import { registerCoreMiddleware } from '../bootstrap/register-core-middleware';
import { registerErrorHandling } from '../bootstrap/register-error-handling';
import { registerRoutes } from '../bootstrap/register-routes';

export function createApp(data: DataBootstrapResult) {
  const app = express();
  const container = createAppContainer(data);

  registerCoreMiddleware(app);
  registerRoutes(app, container);
  registerErrorHandling(app, container);

  return app;
}
