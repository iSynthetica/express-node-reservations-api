import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from '../helpers/create-test-app';

describe('Reservations endpoints', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe('GET /api/v1/amenities/:amenityId/reservations', () => {
    it('returns transformed reservations for amenity + date', async () => {
      const response = await request(app).get(
        '/api/v1/amenities/10/reservations?date=1592179200000',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: 1,
          userId: 1,
          startTime: '05:00',
          duration: 60,
          amenityName: 'Central Gym',
        },
        {
          id: 2,
          userId: 2,
          startTime: '07:00',
          duration: 60,
          amenityName: 'Central Gym',
        },
      ]);
    });

    it('returns validation error when date is missing', async () => {
      const response = await request(app).get('/api/v1/amenities/10/reservations');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns validation error for invalid amenity id', async () => {
      const response = await request(app).get(
        '/api/v1/amenities/not-a-number/reservations?date=1592179200000',
      );

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns not found when amenity does not exist', async () => {
      const response = await request(app).get(
        '/api/v1/amenities/999/reservations?date=1592179200000',
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Amenity not found' });
    });

    it('returns empty array for valid request with no reservations', async () => {
      const response = await request(app).get(
        '/api/v1/amenities/30/reservations?date=1592179200000',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/v1/users/:userId/reservations', () => {
    it('returns grouped reservations by date with transformations', async () => {
      const response = await request(app).get('/api/v1/users/1/reservations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          date: '2020-06-15',
          reservations: [
            {
              id: 1,
              amenityId: 10,
              startTime: '05:00',
              duration: 60,
            },
          ],
        },
        {
          date: '2020-06-16',
          reservations: [
            {
              id: 4,
              amenityId: 20,
              startTime: '02:00',
              duration: 60,
            },
            {
              id: 3,
              amenityId: 10,
              startTime: '09:00',
              duration: 60,
            },
          ],
        },
      ]);
    });

    it('returns validation error for invalid user id', async () => {
      const response = await request(app).get('/api/v1/users/invalid/reservations');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      });
    });

    it('returns empty array when user has no reservations', async () => {
      const response = await request(app).get('/api/v1/users/999/reservations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
