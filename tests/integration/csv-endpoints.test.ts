import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from '../helpers/create-test-app';
import { createInMemoryAuthRepository } from '../helpers/create-in-memory-auth-repository';

function uniqueUsername(prefix: string): string {
  return `${prefix}-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
}

function readTokenFromBody(body: unknown): string {
  expect(body).toBeTypeOf('object');
  expect(body).not.toBeNull();
  const token = (body as Record<string, unknown>).token;
  expect(typeof token).toBe('string');

  if (typeof token !== 'string') {
    throw new Error('Expected token to be a string');
  }

  return token;
}

async function issueAuthToken(
  app: Awaited<ReturnType<typeof createTestApp>>,
  username: string,
  password: string,
): Promise<string> {
  const registerResponse = await request(app).post('/api/v1/auth/register').send({
    username,
    password,
  });
  expect(registerResponse.status).toBe(201);

  const loginResponse = await request(app).post('/api/v1/auth/login').send({
    username,
    password,
  });
  expect(loginResponse.status).toBe(200);
  return readTokenFromBody(loginResponse.body);
}

describe('CSV endpoints', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    app = await createTestApp({
      authRepository: createInMemoryAuthRepository(),
    });
  });

  describe('POST /api/v1/csv/parse', () => {
    it('returns 401 without token', async () => {
      const response = await request(app).post('/api/v1/csv/parse');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 401 for malformed token', async () => {
      const response = await request(app)
        .post('/api/v1/csv/parse')
        .set('Authorization', 'Bearer malformed.token.value');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    });

    it('returns 400 with valid token but missing file', async () => {
      const token = await issueAuthToken(app, uniqueUsername('csv-no-file'), 'secret123');

      const response = await request(app)
        .post('/api/v1/csv/parse')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'No file uploaded',
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns 200 and parsed rows with valid token and CSV file', async () => {
      const token = await issueAuthToken(app, uniqueUsername('csv-ok'), 'secret123');
      const csvContent = 'id;name\n1;Alice\n2;Bob\n';

      const response = await request(app)
        .post('/api/v1/csv/parse')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from(csvContent, 'utf-8'), 'sample.csv');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);
    });
  });
});
