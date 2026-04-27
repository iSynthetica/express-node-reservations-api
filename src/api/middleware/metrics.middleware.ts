import type { NextFunction, Request, Response } from 'express';
import {
  httpRequestDurationSeconds,
  httpRequestsInFlight,
  httpRequestsTotal,
} from '../../app/metrics';

function getRoutePath(req: Request): string | undefined {
  const route = req.route as unknown;

  if (!route || typeof route !== 'object' || !('path' in route)) {
    return undefined;
  }

  const { path } = route;

  return typeof path === 'string' ? path : undefined;
}

function normalizeRoute(req: Request): string {
  const routePath = getRoutePath(req);

  if (routePath) {
    const baseUrl = req.baseUrl;

    return `${baseUrl}${routePath}` || '/';
  }

  if (req.baseUrl) {
    return req.baseUrl;
  }

  return req.path || 'unknown';
}

export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/metrics') {
    next();
    return;
  }

  const method = req.method;
  const initialRoute = normalizeRoute(req);

  httpRequestsInFlight.inc({
    method,
    route: initialRoute,
  });

  const stopTimer = httpRequestDurationSeconds.startTimer();

  res.on('finish', () => {
    const route = normalizeRoute(req);
    const statusCode = String(res.statusCode);

    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
    });

    stopTimer({
      method,
      route,
      status_code: statusCode,
    });

    httpRequestsInFlight.dec({
      method,
      route: initialRoute,
    });
  });

  res.on('close', () => {
    if (!res.writableEnded) {
      httpRequestsInFlight.dec({
        method,
        route: initialRoute,
      });
    }
  });

  next();
}
