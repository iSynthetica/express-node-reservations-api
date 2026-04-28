import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/app.error';
import { ERROR_CODES } from '../../shared/errors/error-codes';
import type { AuthRepositoryPort } from './auth.repository.port';
import type { PublicAuthUser } from './auth.types';
import { signAccessToken } from './auth.jwt';

interface RegisterInput {
  username: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface AuthService {
  register(input: RegisterInput): Promise<PublicAuthUser>;
  login(input: LoginInput): Promise<{ token: string }>;
}

interface CreateAuthServiceDeps {
  authRepository: AuthRepositoryPort;
}

function isUniqueUsernameConstraintError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as { message?: unknown };
  return (
    typeof candidate.message === 'string' &&
    candidate.message.includes('UNIQUE constraint failed: users.username')
  );
}

export function createAuthService({ authRepository }: CreateAuthServiceDeps): AuthService {
  return {
    async register(input: RegisterInput): Promise<PublicAuthUser> {
      // Defensive guard in case route validation is bypassed.
      if (!input.username || !input.password) {
        throw new AppError(400, 'Validation failed', {
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      const existingUser = await authRepository.findByUsername(input.username);

      if (existingUser) {
        throw new AppError(409, 'Username already exists', {
          code: ERROR_CODES.CONFLICT,
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      try {
        return await authRepository.createUser({
          username: input.username,
          passwordHash,
        });
      } catch (error) {
        if (isUniqueUsernameConstraintError(error)) {
          throw new AppError(409, 'Username already exists', {
            code: ERROR_CODES.CONFLICT,
          });
        }
        throw error;
      }
    },

    async login(input: LoginInput): Promise<{ token: string }> {
      // Defensive guard in case route validation is bypassed.
      if (!input.username || !input.password) {
        throw new AppError(400, 'Validation failed', {
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }
      const user = await authRepository.findByUsername(input.username);
      if (!user) {
        throw new AppError(401, 'Invalid credentials', {
          code: ERROR_CODES.UNAUTHORIZED,
        });
      }
      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid credentials', {
          code: ERROR_CODES.UNAUTHORIZED,
        });
      }
      const token = signAccessToken({
        sub: String(user.id),
        username: user.username,
      });
      return { token };
    },
  };
}

export type { AuthService, RegisterInput, LoginInput };
