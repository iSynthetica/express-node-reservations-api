import type { Request, RequestHandler } from 'express';
import { AppError } from '../../shared/errors/app.error';
import { ERROR_CODES } from '../../shared/errors/error-codes';
import { verifyAccessToken, type AccessTokenPayload } from './auth.jwt';

export interface AuthenticatedRequest extends Request {
  auth?: AccessTokenPayload;
}

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req.header('authorization'));

  if (!token) {
    next(
      new AppError(401, 'Unauthorized', {
        code: ERROR_CODES.UNAUTHORIZED,
      }),
    );
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).auth = payload;
    next();
  } catch (error) {
    next(error);
  }
};
