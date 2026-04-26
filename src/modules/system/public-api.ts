import { createSystemRouter } from './presentation/http/system.routes';
import type { MetricsReaderPort } from '../../shared/ports/metrics-reader.port';

interface SystemModuleDependencies {
  metricsReader: MetricsReaderPort;
}

export function createSystemModuleRouter({ metricsReader }: SystemModuleDependencies) {
  return createSystemRouter({ metricsReader });
}
