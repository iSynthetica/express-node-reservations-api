import type { MetricsReaderPort } from '../../shared/ports/metrics-reader.port';
import { createSystemRouter } from './system.routes';

interface SystemModuleDependencies {
  metricsReader: MetricsReaderPort;
}

export function createSystemModuleRouter({ metricsReader }: SystemModuleDependencies) {
  return createSystemRouter({ metricsReader });
}
