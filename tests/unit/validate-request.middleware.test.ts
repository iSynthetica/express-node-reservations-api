import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../src/api/middleware/validate-request.middleware';
import { AppError } from '../../src/shared/errors/app.error';
import { ERROR_CODES } from '../../src/shared/errors/error-codes';

describe('validate-request.middleware', () => {
  it('calls next and assigns parsed values for valid input', () => {
    const schema = z.object({
      params: z.object({ id: z.coerce.number().int().positive() }),
      query: z.object({ page: z.coerce.number().int().positive() }),
      body: z.object({ name: z.string().min(1) }),
    });

    const middleware = validateRequest(schema);
    const req = {
      params: { id: '5' },
      query: { page: '2' },
      body: { name: 'Alice' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(req.params).toEqual({ id: 5 });
    expect(req.query).toEqual({ page: 2 });
    expect(req.body).toEqual({ name: 'Alice' });
    expect(next).toHaveBeenCalledWith();
  });

  it('passes AppError(400, VALIDATION_ERROR) on zod validation failure', () => {
    const schema = z.object({
      body: z.object({
        name: z.string().min(3),
      }),
    });
    const middleware = validateRequest(schema);

    const req = {
      params: {},
      query: {},
      body: { name: 'ab' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next as NextFunction);

    const error = next.mock.lastCall?.[0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.message).toBe('Validation failed');
  });

  it('passes through non-zod errors to next(error)', () => {
    const schema = z
      .object({
        body: z.object({
          name: z.string(),
        }),
      })
      .transform(() => {
        throw new Error('boom');
      });
    const middleware = validateRequest(schema);

    const req = {
      params: {},
      query: {},
      body: { name: 'ok' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next as NextFunction);

    const error = next.mock.lastCall?.[0] as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('boom');
  });
});
