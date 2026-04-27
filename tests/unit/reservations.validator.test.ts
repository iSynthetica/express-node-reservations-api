import { describe, expect, it } from 'vitest';
import { validateReservations } from '../../src/modules/reservations/reservations.validator';

describe('reservations.validator', () => {
  it('returns no validation issues for valid reservations', () => {
    const errors = validateReservations([
      {
        id: 1,
        amenityId: 10,
        userId: 5,
        startTime: 300,
        endTime: 360,
        date: 1592179200000,
      },
    ]);

    expect(errors).toEqual([]);
  });

  it('returns validation issues for invalid ids and timestamps', () => {
    const errors = validateReservations([
      {
        id: Number.NaN,
        amenityId: Number.NaN,
        userId: Number.NaN,
        startTime: Number.NaN,
        endTime: Number.NaN,
        date: Number.NaN,
      },
    ]);

    expect(errors).toEqual([
      { entity: 'reservation', id: Number.NaN, reason: 'invalid or missing id' },
      { entity: 'reservation', id: Number.NaN, reason: 'invalid amenity_id' },
      { entity: 'reservation', id: Number.NaN, reason: 'invalid user_id' },
      { entity: 'reservation', id: Number.NaN, reason: 'invalid start_time or end_time' },
      { entity: 'reservation', id: Number.NaN, reason: 'invalid date timestamp' },
    ]);
  });

  it('returns validation issue when start time is not less than end time', () => {
    const errors = validateReservations([
      {
        id: 2,
        amenityId: 10,
        userId: 5,
        startTime: 600,
        endTime: 600,
        date: 1592179200000,
      },
    ]);

    expect(errors).toEqual([
      {
        entity: 'reservation',
        id: 2,
        reason: 'start_time (600) must be less than end_time (600)',
      },
    ]);
  });
});
