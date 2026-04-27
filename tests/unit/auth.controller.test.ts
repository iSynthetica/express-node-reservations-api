import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createAuthController } from '../../src/modules/auth/auth.controller';
import type { AuthService } from '../../src/modules/auth/auth.service';

function createResponse(): {
  res: Response;
  statusMock: ReturnType<typeof vi.fn>;
  jsonMock: ReturnType<typeof vi.fn>;
} {
  const statusMock = vi.fn();
  const jsonMock = vi.fn();
  statusMock.mockReturnValue({
    status: statusMock,
    json: jsonMock,
  });
  const response = {
    status: statusMock,
    json: jsonMock,
  } as unknown as Response;
  return { res: response, statusMock, jsonMock };
}

function createAuthServiceMock(): {
  authService: AuthService;
  registerMock: ReturnType<typeof vi.fn>;
  loginMock: ReturnType<typeof vi.fn>;
} {
  const registerMock = vi.fn();
  const loginMock = vi.fn();

  return {
    authService: {
      register: registerMock,
      login: loginMock,
    },
    registerMock,
    loginMock,
  };
}

describe('auth.controller', () => {
  it('register responds with 201 and public user', async () => {
    const { authService, registerMock } = createAuthServiceMock();
    registerMock.mockResolvedValueOnce({
      id: 7,
      username: 'alice',
    });

    const controller = createAuthController({ authService });
    const req = {
      body: { username: 'alice', password: 'secret123' },
    } as Request;
    const { res, statusMock, jsonMock } = createResponse();

    await controller.register(req, res);

    expect(registerMock).toHaveBeenCalledWith({ username: 'alice', password: 'secret123' });
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({ id: 7, username: 'alice' });
  });

  it('login responds with 200 and token', async () => {
    const { authService, loginMock } = createAuthServiceMock();
    loginMock.mockResolvedValueOnce({
      token: 'jwt-token',
    });

    const controller = createAuthController({ authService });
    const req = {
      body: { username: 'alice', password: 'secret123' },
    } as Request;
    const { res, statusMock, jsonMock } = createResponse();

    await controller.login(req, res);

    expect(loginMock).toHaveBeenCalledWith({ username: 'alice', password: 'secret123' });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ token: 'jwt-token' });
  });
});
