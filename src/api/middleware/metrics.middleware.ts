import type { NextFunction, Request, Response } from 'express';
import client from 'prom-client';
import { env } from '../../app/env';

const metricsRegistry = new client.Registry();

metricsRegistry.setDefaultLabels({
  app: env.APP_NAME,
});

client.collectDefaultMetrics({
  register: metricsRegistry,
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [metricsRegistry],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry],
});

const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Current number of in-flight HTTP requests',
  labelNames: ['method', 'route'] as const,
  registers: [metricsRegistry],
});

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

export async function getMetrics(): Promise<string> {
  return metricsRegistry.metrics();
}

export function getMetricsContentType(): string {
  return metricsRegistry.contentType;
}
