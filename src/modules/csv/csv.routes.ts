import { Router } from 'express';
import type { CsvController } from './csv.controller';
import { uploadSingleCsv } from './infra/csv-upload.middleware';

interface CsvRouterDeps {
  controller: CsvController;
}

export function createCsvRouter({ controller }: CsvRouterDeps): Router {
  const router = Router();

  router.post('/csv/parse', uploadSingleCsv, controller.parseCsv);

  return router;
}
