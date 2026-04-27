import jwt from 'jsonwebtoken';
import { env } from '../../app/env';

interface AccessTokenPayload {
  sub: string;
  username: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const secret: jwt.Secret = env.JWT_SECRET;
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}
