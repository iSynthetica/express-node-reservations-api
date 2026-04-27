import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../../src/modules/auth/auth.middleware';
import { AppError } from '../../src/shared/errors/app.error';
import { ERROR_CODES } from '../../src/shared/errors/error-codes';

const { verifyAccessTokenMock } = vi.hoisted(() => ({
  verifyAccessTokenMock: vi.fn(),
}));

vi.mock('../../src/modules/auth/auth.jwt', () => ({
  verifyAccessToken: verifyAccessTokenMock,
}));

function createRequest(authorization?: string): Request {
  return {
    header: vi.fn((name: string) => (name === 'authorization' ? authorization : undefined)),
  } as unknown as Request;
}

describe('auth.middleware', () => {
  it('returns 401 when Authorization header is missing', () => {
    const req = createRequest();
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next as NextFunction);

    const error = next.mock.lastCall?.[0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('returns 401 for non-bearer Authorization scheme', () => {
    const req = createRequest('Basic abc123');
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next as NextFunction);

    const error = next.mock.lastCall?.[0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('returns 401 for empty bearer token', () => {
    const req = createRequest('Bearer');
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next as NextFunction);

    const error = next.mock.lastCall?.[0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('attaches payload and calls next() for valid token', () => {
    verifyAccessTokenMock.mockReturnValueOnce({ sub: '7', username: 'valid-user' });

    const req = createRequest('Bearer token123') as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next as NextFunction);

    expect(req.auth).toEqual({ sub: '7', username: 'valid-user' });
    expect(next).toHaveBeenCalledWith();
  });
});
