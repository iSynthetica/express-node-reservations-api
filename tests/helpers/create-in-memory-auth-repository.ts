import type {
  AuthRepositoryPort,
  AuthUser,
  CreateAuthUserInput,
  PublicAuthUser,
} from '../../src/modules/auth';

export function createInMemoryAuthRepository(): AuthRepositoryPort {
  const users: AuthUser[] = [];
  let nextId = 1;

  return {
    findByUsername(username: string): Promise<AuthUser | null> {
      const user = users.find((candidate) => candidate.username === username) ?? null;
      return Promise.resolve(user);
    },
    createUser(input: CreateAuthUserInput): Promise<PublicAuthUser> {
      const user: AuthUser = {
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
