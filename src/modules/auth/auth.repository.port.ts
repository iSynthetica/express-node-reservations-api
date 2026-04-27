import type { AuthUser, CreateAuthUserInput, PublicAuthUser } from './auth.types';

export interface AuthRepositoryPort {
  findByUsername(username: string): Promise<AuthUser | null>;
  createUser(input: CreateAuthUserInput): Promise<PublicAuthUser>;
}
