import client from 'prom-client';
import { env } from './env';

export const metricsRegistry = new client.Registry();

metricsRegistry.setDefaultLabels({
  app: env.APP_NAME,
});

client.collectDefaultMetrics({
  register: metricsRegistry,
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [metricsRegistry],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry],
});

export const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Current number of in-flight HTTP requests',
  labelNames: ['method', 'route'] as const,
  registers: [metricsRegistry],
});

export async function getMetrics(): Promise<string> {
  return metricsRegistry.metrics();
}
