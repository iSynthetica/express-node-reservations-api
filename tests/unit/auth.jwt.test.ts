import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../../src/modules/auth/auth.jwt';
import { AppError } from '../../src/shared/errors/app.error';
import { ERROR_CODES } from '../../src/shared/errors/error-codes';

describe('auth.jwt', () => {
  it('signAccessToken returns a non-empty token', () => {
    const token = signAccessToken({ sub: '1', username: 'john' });

    expect(token).toEqual(expect.any(String));
    expect(token.length).toBeGreaterThan(0);
  });

  it('verifyAccessToken returns payload for a valid token', () => {
    const token = signAccessToken({ sub: '42', username: 'alice' });

    expect(verifyAccessToken(token)).toEqual({
      sub: '42',
      username: 'alice',
    });
  });

  it('verifyAccessToken throws unauthorized for malformed token', () => {
    try {
      verifyAccessToken('not-a-jwt-token');
      throw new Error('Expected verifyAccessToken to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.statusCode).toBe(401);
      expect(appError.code).toBe(ERROR_CODES.UNAUTHORIZED);
      expect(appError.message).toBe('Unauthorized');
    }
  });
});
