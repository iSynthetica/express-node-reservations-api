import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from '../helpers/create-test-app';
import { createInMemoryAuthRepository } from '../helpers/create-in-memory-auth-repository';

function uniqueUsername(prefix: string): string {
  return `${prefix}-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
}

function expectObjectBody(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf('object');
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}

describe('Auth endpoints', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    app = await createTestApp({
      authRepository: createInMemoryAuthRepository(),
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('returns 201 with id and username for valid payload', async () => {
      const username = uniqueUsername('register-ok');
      const response = await request(app).post('/api/v1/auth/register').send({
        username,
        password: 'secret123',
      });

      expect(response.status).toBe(201);
      const body = expectObjectBody(response.body);
      expect(typeof body.id).toBe('number');
      expect(body.username).toBe(username);
      expect(body.password).toBeUndefined();
      expect(body.passwordHash).toBeUndefined();
    });

    it('returns 409 for duplicate username', async () => {
      const username = uniqueUsername('register-dup');

      const first = await request(app).post('/api/v1/auth/register').send({
        username,
        password: 'secret123',
      });
      expect(first.status).toBe(201);

      const second = await request(app).post('/api/v1/auth/register').send({
        username,
        password: 'secret123',
      });

      expect(second.status).toBe(409);
      expect(second.body).toMatchObject({
        message: 'Username already exists',
        code: 'CONFLICT',
      });
    });

    it('returns 400 validation error for invalid register body', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        username: 'ab',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 and token for valid credentials', async () => {
      const username = uniqueUsername('login-ok');
      await request(app).post('/api/v1/auth/register').send({
        username,
        password: 'secret123',
      });

      const response = await request(app).post('/api/v1/auth/login').send({
        username,
        password: 'secret123',
      });

      expect(response.status).toBe(200);
      const body = expectObjectBody(response.body);
      const token = body.token;
      expect(typeof token).toBe('string');
      if (typeof token === 'string') {
        expect(token.length).toBeGreaterThan(0);
      }
    });

    it('returns 401 for unknown user or wrong password', async () => {
      const unknownUser = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: uniqueUsername('unknown'),
          password: 'secret123',
        });

      expect(unknownUser.status).toBe(401);
      expect(unknownUser.body).toMatchObject({
        message: 'Invalid credentials',
        code: 'UNAUTHORIZED',
      });

      const username = uniqueUsername('wrong-pass');
      await request(app).post('/api/v1/auth/register').send({
        username,
        password: 'secret123',
      });

      const wrongPassword = await request(app).post('/api/v1/auth/login').send({
        username,
        password: 'wrong-secret',
      });

      expect(wrongPassword.status).toBe(401);
      expect(wrongPassword.body).toMatchObject({
        message: 'Invalid credentials',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 400 validation error for invalid login body', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: '',
        password: '',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      });
    });
  });
});
