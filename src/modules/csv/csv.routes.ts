import { Router, type RequestHandler } from 'express';
import type { CsvController } from './csv.controller';
import { uploadSingleCsv } from './infra/csv-upload.middleware';

interface CsvRouterDeps {
  controller: CsvController;
  authMiddleware: RequestHandler;
}

export function createCsvRouter({ controller, authMiddleware }: CsvRouterDeps): Router {
  const router = Router();

  router.post('/csv/parse', authMiddleware, uploadSingleCsv, controller.parseCsv);

  return router;
}
