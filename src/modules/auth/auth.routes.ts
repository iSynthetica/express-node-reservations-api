import { Router } from 'express';
import type { AuthController } from './auth.controller';
import { validateRequest } from '../../shared/middleware/validate-request.middleware';
import { registerSchema } from './auth.schemas';

interface AuthRouterDeps {
  controller: AuthController;
}

export function createAuthRouter({ controller }: AuthRouterDeps): Router {
  const router = Router();

  router.post('/auth/register', validateRequest(registerSchema), controller.register);

  return router;
}
