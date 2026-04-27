import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { createAuthService } from '../../src/modules/auth/auth.service';
import type { AuthRepositoryPort } from '../../src/modules/auth';
import type { AppError } from '../../src/shared/errors/app.error';
import { ERROR_CODES } from '../../src/shared/errors/error-codes';

function createInMemoryAuthRepository(): AuthRepositoryPort {
  const users: {
    id: number;
    username: string;
    passwordHash: string;
    createdAt: number;
  }[] = [];
  let nextId = 1;

  return {
    findByUsername(username: string) {
      const user = users.find((candidate) => candidate.username === username) ?? null;
      return Promise.resolve(user);
    },
    createUser(input) {
      const user = {
        id: nextId,
        username: input.username,
        passwordHash: input.passwordHash,
        createdAt: Date.now(),
      };
      users.push(user);
      nextId += 1;
      return Promise.resolve({
        id: user.id,
        username: user.username,
      });
    },
  };
}

describe('auth.service', () => {
  it('register creates a new user with hashed password', async () => {
    const repository = createInMemoryAuthRepository();
    const service = createAuthService({ authRepository: repository });
    const registered = await service.register({ username: 'alice', password: 'secret123' });
    const stored = await repository.findByUsername('alice');

    expect(registered).toEqual({ id: 1, username: 'alice' });
    expect(stored).not.toBeNull();
    if (stored === null) {
      throw new Error('Expected stored user');
    }
    expect(stored.username).toBe('alice');
    expect(stored.passwordHash).not.toBe('secret123');
    expect(bcrypt.compareSync('secret123', stored.passwordHash)).toBe(true);
  });

  it('register throws conflict for duplicate username', async () => {
    const repository = createInMemoryAuthRepository();
    const service = createAuthService({ authRepository: repository });
    await service.register({ username: 'alice', password: 'secret123' });

    await expect(
      service.register({ username: 'alice', password: 'secret123' }),
    ).rejects.toMatchObject<Partial<AppError>>({
      statusCode: 409,
      code: ERROR_CODES.CONFLICT,
    });
  });

  it('login returns token for valid credentials', async () => {
    const repository = createInMemoryAuthRepository();
    const service = createAuthService({ authRepository: repository });
    await service.register({ username: 'alice', password: 'secret123' });
    const result = await service.login({ username: 'alice', password: 'secret123' });

    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  it('login throws unauthorized for wrong credentials', async () => {
    const repository = createInMemoryAuthRepository();
    const service = createAuthService({ authRepository: repository });

    await expect(
      service.login({ username: 'missing', password: 'secret123' }),
    ).rejects.toMatchObject<Partial<AppError>>({
      statusCode: 401,
      code: ERROR_CODES.UNAUTHORIZED,
    });
  });
});
