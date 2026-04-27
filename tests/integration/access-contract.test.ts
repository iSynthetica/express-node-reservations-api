import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from '../helpers/create-test-app';
import { createInMemoryAuthRepository } from '../helpers/create-in-memory-auth-repository';

describe('Route access contract', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeEach(async () => {
    app = await createTestApp({
      authRepository: createInMemoryAuthRepository(),
    });
  });

  it('auth endpoints are public', async () => {
    const username = `contract-${String(Date.now())}`;
    const register = await request(app).post('/api/v1/auth/register').send({
      username,
      password: 'secret123',
    });

    expect(register.status).toBe(201);

    const login = await request(app).post('/api/v1/auth/login').send({
      username,
      password: 'secret123',
    });

    expect(login.status).toBe(200);
    const body = login.body as Record<string, unknown>;
    expect(typeof body.token).toBe('string');
  });

  it('reservations endpoint remains public', async () => {
    const response = await request(app).get('/api/v1/users/1/reservations');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('csv parse endpoint requires jwt', async () => {
    const response = await request(app).post('/api/v1/csv/parse');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});
