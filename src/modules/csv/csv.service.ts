import { AppError } from '../../shared/errors/app.error';
import { ERROR_CODES } from '../../shared/errors/error-codes';
import { parseCsvRows } from '../../shared/utils/csv-loader';

export type ParsedCsvRow = Record<string, string>;

export interface CsvService {
  parseBuffer(buffer: Buffer): ParsedCsvRow[];
}

export function createCsvService(): CsvService {
  return {
    parseBuffer(buffer: Buffer): ParsedCsvRow[] {
      const content = buffer.toString('utf-8').trim();

      if (content.length === 0) {
        throw new AppError(400, 'CSV file is empty', {
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      try {
        return parseCsvRows<ParsedCsvRow>(content);
      } catch (cause) {
        throw new AppError(400, 'Invalid CSV format', {
          code: ERROR_CODES.VALIDATION_ERROR,
          cause,
        });
      }
    },
  };
}
