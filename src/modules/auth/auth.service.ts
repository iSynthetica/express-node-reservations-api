import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/app.error';
import { ERROR_CODES } from '../../shared/errors/error-codes';
import type { AuthRepositoryPort } from './auth.repository.port';
import type { PublicAuthUser } from './auth.types';

interface RegisterInput {
  username: string;
  password: string;
}

interface AuthService {
  register(input: RegisterInput): Promise<PublicAuthUser>;
}

interface CreateAuthServiceDeps {
  authRepository: AuthRepositoryPort;
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

      return authRepository.createUser({
        username: input.username,
        passwordHash,
      });
    },
  };
}

export type { AuthService, RegisterInput };
