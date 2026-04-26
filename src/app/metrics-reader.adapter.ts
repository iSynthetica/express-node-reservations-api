import { getMetrics, metricsRegistry } from './metrics';
import type { MetricsReaderPort } from '../shared/ports/metrics-reader.port';

export const appMetricsReader: MetricsReaderPort = {
  contentType: metricsRegistry.contentType,
  getMetrics,
};
