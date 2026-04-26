import type { MetricsReaderPort } from '../../../../shared/ports/metrics-reader.port';

interface GetMetricsOutput {
  contentType: string;
  payload: string;
}

export async function getMetricsUseCase(
  metricsReader: MetricsReaderPort,
): Promise<GetMetricsOutput> {
  return {
    contentType: metricsReader.contentType,
    payload: await metricsReader.getMetrics(),
  };
}
