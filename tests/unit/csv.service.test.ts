import { describe, expect, it } from 'vitest';
import { createCsvService } from '../../src/modules/csv/csv.service';
import { AppError } from '../../src/shared/errors/app.error';
import { ERROR_CODES } from '../../src/shared/errors/error-codes';

describe('csv.service', () => {
  const service = createCsvService();

  it('throws validation error for empty file buffer', () => {
    try {
      service.parseBuffer(Buffer.from('   ', 'utf-8'));
      throw new Error('Expected parseBuffer to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(appError.message).toBe('CSV file is empty');
    }
  });

  it('parses valid CSV buffer with headers', () => {
    const rows = service.parseBuffer(Buffer.from('id;name\n1;Alice\n2;Bob', 'utf-8'));

    expect(rows).toEqual([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);
  });

  it('throws validation error for malformed CSV content', () => {
    try {
      service.parseBuffer(Buffer.from('id;name\n1;"broken', 'utf-8'));
      throw new Error('Expected parseBuffer to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(appError.message).toBe('Invalid CSV format');
    }
  });
});
