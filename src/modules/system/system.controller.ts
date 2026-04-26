import type { Request, Response } from 'express';
import type { MetricsReaderPort } from '../../shared/ports/metrics-reader.port';
import { getMetrics } from './system.service';

interface SystemControllerDependencies {
  metricsReader: MetricsReaderPort;
}

export function createSystemController({ metricsReader }: SystemControllerDependencies) {
  return {
    rootHandler: (req: Request, res: Response): void => {
      req.log.debug('Serving root endpoint');

      res.status(200).json({
        message: 'Express + TypeScript starter is running',
      });
    },

    healthHandler: (req: Request, res: Response): void => {
      req.log.debug('Serving health endpoint');

      res.status(200).json({
        status: 'ok',
      });
    },

    slowHandler: async (req: Request, res: Response): Promise<void> => {
      req.log.info({ delayMs: 5000 }, 'Slow handler started');

      await new Promise((resolve) => setTimeout(resolve, 5000));

      req.log.info({ delayMs: 5000 }, 'Slow handler finished');

      res.status(200).json({
        status: 'ok',
      });
    },

    metricsHandler: async (req: Request, res: Response): Promise<void> => {
      req.log.debug('Metrics endpoint requested');

      const result = await getMetrics(metricsReader);
      res.setHeader('Content-Type', result.contentType);
      res.send(result.payload);
    },

    errorTestHandler: (req: Request, _res: Response): void => {
      req.log.warn('Error test endpoint triggered');

      throw new Error('Test error');
    },
  };
}
