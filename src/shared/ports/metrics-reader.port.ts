export interface MetricsReaderPort {
  contentType: string;
  getMetrics(): Promise<string>;
}
