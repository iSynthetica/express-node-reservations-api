import type { Request, Response } from 'express';
import { getMetrics, getMetricsContentType } from '../../api/middleware/metrics.middleware';

export function createSystemController() {
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

      const payload = await getMetrics();
      res.setHeader('Content-Type', getMetricsContentType());
      res.send(payload);
    },

    errorTestHandler: (req: Request, _res: Response): void => {
      req.log.warn('Error test endpoint triggered');

      throw new Error('Test error');
    },
  };
}
