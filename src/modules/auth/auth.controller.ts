import type { Request, Response } from 'express';
import type { AuthService } from './auth.service';
import type { LoginInputSchema, RegisterInputSchema } from './auth.schemas';

interface CreateAuthControllerDeps {
  authService: AuthService;
}

export function createAuthController({ authService }: CreateAuthControllerDeps) {
  return {
    register: async (req: Request, res: Response): Promise<void> => {
      const { username, password } = req.body as RegisterInputSchema['body'];

      const user = await authService.register({ username, password });

      res.status(201).json({
        id: user.id,
        username: user.username,
      });
    },

    login: async (req: Request, res: Response): Promise<void> => {
      const { username, password } = req.body as LoginInputSchema['body'];
      const result = await authService.login({ username, password });

      res.status(200).json(result);
    },
  };
}

export type AuthController = ReturnType<typeof createAuthController>;
