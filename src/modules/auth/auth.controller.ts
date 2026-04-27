import type { Request, Response } from 'express';
import type { AuthService } from './auth.service';
import type { RegisterInputSchema } from './auth.schemas';

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
  };
}

export type AuthController = ReturnType<typeof createAuthController>;
