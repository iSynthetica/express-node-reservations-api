import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app.error';
import { ERROR_CODES } from '../../shared/errors/error-codes';
import type { CsvService } from './csv.service';

interface CsvControllerDeps {
  csvService: CsvService;
}

export function createCsvController({ csvService }: CsvControllerDeps) {
  return {
    parseCsv: (req: Request, res: Response): void => {
      if (!req.file) {
        throw new AppError(400, 'No file uploaded', {
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      const rows = csvService.parseBuffer(req.file.buffer);
      res.status(200).json(rows);
    },
  };
}

export type CsvController = ReturnType<typeof createCsvController>;
