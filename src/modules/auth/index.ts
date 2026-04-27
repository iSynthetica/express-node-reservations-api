import type { Router } from 'express';
import { createAuthController, type AuthController } from './auth.controller';
import type { AuthRepositoryPort } from './auth.repository.port';
import { createAuthRouter } from './auth.routes';
import { AuthSqliteRepository } from './auth-sqlite.repository';
import { createAuthService, type AuthService } from './auth.service';

export function createAuthSqliteRepository(): AuthSqliteRepository {
  return new AuthSqliteRepository();
}

export interface CreateAuthModuleRouterDeps {
  authRepository?: AuthRepositoryPort;
}

export function createAuthModuleRouter({
  authRepository,
}: CreateAuthModuleRouterDeps = {}): Router {
  const repository = authRepository ?? createAuthSqliteRepository();
  const authService: AuthService = createAuthService({ authRepository: repository });
  const authController: AuthController = createAuthController({ authService });

  return createAuthRouter({ controller: authController });
}

export type { AuthRepositoryPort } from './auth.repository.port';
export type { AuthUser, CreateAuthUserInput, PublicAuthUser } from './auth.types';
export type { AuthService } from './auth.service';
export type { AuthController } from './auth.controller';
