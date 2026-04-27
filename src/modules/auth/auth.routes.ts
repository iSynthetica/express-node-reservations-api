import { Router } from 'express';
import type { AuthController } from './auth.controller';

interface AuthRouterDeps {
  controller: AuthController;
}

export function createAuthRouter({ controller }: AuthRouterDeps): Router {
  const router = Router();

  router.post('/auth/register', controller.register);

  return router;
}
