import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';

import { AppError } from '../../../shared/errors/app.error';
import { ERROR_CODES } from '../../../shared/errors/error-codes';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const isCsvFile = (file: Express.Multer.File): boolean => {
  return file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
};

const csvFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (!isCsvFile(file)) {
    cb(
      new AppError(400, 'Only CSV files are allowed', {
        code: ERROR_CODES.VALIDATION_ERROR,
      }),
    );

    return;
  }

  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: csvFileFilter,
});

export const uploadSingleCsv = upload.single('file');
