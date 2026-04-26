import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/app.error';
import { ERROR_CODES } from '../errors/error-codes';

interface ParsedRequestShape {
  params?: unknown;
  query?: unknown;
  body?: unknown;
}

export function validateRequest(schema: z.ZodType<ParsedRequestShape>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const requestInput: ParsedRequestShape = {
        params: req.params,
        query: req.query,
        body: req.body as unknown,
      };
      const parsed = schema.parse(requestInput);

      if (parsed.params !== undefined) {
        Object.assign(req.params, parsed.params);
      }

      if (parsed.query !== undefined) {
        Object.assign(req.query as object, parsed.query);
      }

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(400, 'Validation failed', {
            code: ERROR_CODES.VALIDATION_ERROR,
            details: z.treeifyError(error),
          }),
        );
        return;
      }

      next(error);
    }
  };
}
