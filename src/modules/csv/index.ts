import type { RequestHandler, Router } from 'express';
import { createCsvController, type CsvController } from './csv.controller';
import { createCsvRouter } from './csv.routes';
import { createCsvService, type CsvService } from './csv.service';

interface CreateCsvModuleRouterDeps {
  authMiddleware: RequestHandler;
}

export function createCsvModuleRouter({ authMiddleware }: CreateCsvModuleRouterDeps): Router {
  const csvService: CsvService = createCsvService();
  const csvController: CsvController = createCsvController({ csvService });

  return createCsvRouter({ controller: csvController, authMiddleware });
}

export { createCsvService } from './csv.service';
export type { CsvService } from './csv.service';
export type { CsvController } from './csv.controller';
