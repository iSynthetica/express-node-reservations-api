import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createCsvController } from '../../src/modules/csv/csv.controller';
import { AppError } from '../../src/shared/errors/app.error';
import { ERROR_CODES } from '../../src/shared/errors/error-codes';
import type { CsvService } from '../../src/modules/csv';

function createResponse(): {
  res: Response;
  statusMock: ReturnType<typeof vi.fn>;
  jsonMock: ReturnType<typeof vi.fn>;
} {
  const statusMock = vi.fn();
  const jsonMock = vi.fn();
  statusMock.mockReturnValue({
    status: statusMock,
    json: jsonMock,
  });
  const response = {
    status: statusMock,
    json: jsonMock,
  } as unknown as Response;
  return { res: response, statusMock, jsonMock };
}

function createCsvServiceMock(): {
  csvService: CsvService;
  parseBufferMock: ReturnType<typeof vi.fn>;
} {
  const parseBufferMock = vi.fn();
  return {
    csvService: {
      parseBuffer: parseBufferMock,
    },
    parseBufferMock,
  };
}

describe('csv.controller', () => {
  it('throws validation error when file is missing', () => {
    const { csvService } = createCsvServiceMock();
    const controller = createCsvController({ csvService });
    const req = {} as Request;
    const { res } = createResponse();

    let thrownError: unknown;
    try {
      controller.parseCsv(req, res);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(AppError);
    const appError = thrownError as AppError;
    expect(appError.statusCode).toBe(400);
    expect(appError.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(appError.message).toBe('No file uploaded');
  });

  it('returns parsed rows when file is present', () => {
    const { csvService, parseBufferMock } = createCsvServiceMock();
    parseBufferMock.mockReturnValueOnce([{ id: '1', name: 'Alice' }]);

    const controller = createCsvController({ csvService });
    const req = {
      file: {
        buffer: Buffer.from('id;name\n1;Alice\n', 'utf-8'),
      },
    } as Request;
    const { res, statusMock, jsonMock } = createResponse();

    controller.parseCsv(req, res);

    expect(parseBufferMock).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith([{ id: '1', name: 'Alice' }]);
  });
});
