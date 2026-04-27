import { Router } from 'express';
import type { AuthController } from './auth.controller';
import { validateRequest } from '../../api/middleware/validate-request.middleware';
import { loginSchema, registerSchema } from './auth.schemas';

interface AuthRouterDeps {
  controller: AuthController;
}

export function createAuthRouter({ controller }: AuthRouterDeps): Router {
  const router = Router();

  router.post('/auth/register', validateRequest(registerSchema), controller.register);
  router.post('/auth/login', validateRequest(loginSchema), controller.login);

  return router;
}
