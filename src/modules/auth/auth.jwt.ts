import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/errors/app.error';
import { ERROR_CODES } from '../../shared/errors/error-codes';
import { env } from '../../app/env';

export interface AccessTokenPayload {
  sub: string;
  username: string;
}

function parseExpiresInToSeconds(value: string): number {
  const trimmed = value.trim();
  const match = /^(\d+)([smhd]?)$/i.exec(trimmed);

  if (!match) {
    return 3600;
  }

  const amount = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();

  if (unit === 'm') {
    return amount * 60;
  }
  if (unit === 'h') {
    return amount * 60 * 60;
  }
  if (unit === 'd') {
    return amount * 60 * 60 * 24;
  }

  return amount;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const secret: jwt.Secret = env.JWT_SECRET;
  const expiresInSeconds = parseExpiresInToSeconds(env.JWT_EXPIRES_IN);
  const tokenPayload: jwt.JwtPayload = {
    sub: payload.sub,
    username: payload.username,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  return jwt.sign(tokenPayload, secret);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret: jwt.Secret = env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string' ||
      typeof decoded.username !== 'string'
    ) {
      throw new AppError(401, 'Unauthorized', {
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }

    return {
      sub: decoded.sub,
      username: decoded.username,
    };
  } catch {
    throw new AppError(401, 'Unauthorized', {
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }
}
