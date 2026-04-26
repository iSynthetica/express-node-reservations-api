import { describe, expect, it } from 'vitest';
import {
  groupUserReservationsByDate,
  mapAmenityReservations,
} from '../../src/modules/reservations/reservations.service';
import { type Reservation } from '../../src/modules/reservations/reservations.types';

describe('reservations service transformations', () => {
  const reservations: Reservation[] = [
    {
      id: 11,
      amenityId: 10,
      userId: 7,
      startTime: 540,
      endTime: 600,
      date: 1592265600000,
    },
    {
      id: 12,
      amenityId: 10,
      userId: 8,
      startTime: 300,
      endTime: 360,
      date: 1592179200000,
    },
    {
      id: 13,
      amenityId: 20,
      userId: 7,
      startTime: 120,
      endTime: 180,
      date: 1592265600000,
    },
  ];

  it('maps amenity reservations with formatted time and duration', () => {
    expect(mapAmenityReservations([...reservations], 'Central Gym')).toEqual([
      {
        id: 13,
        userId: 7,
        startTime: '02:00',
        duration: 60,
        amenityName: 'Central Gym',
      },
      {
        id: 12,
        userId: 8,
        startTime: '05:00',
        duration: 60,
        amenityName: 'Central Gym',
      },
      {
        id: 11,
        userId: 7,
        startTime: '09:00',
        duration: 60,
        amenityName: 'Central Gym',
      },
    ]);
  });

  it('groups reservations by date and sorts both groups and entries', () => {
    expect(groupUserReservationsByDate(reservations)).toEqual([
      {
        date: '2020-06-15',
        reservations: [
          {
            id: 12,
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
            id: 13,
            amenityId: 20,
            startTime: '02:00',
            duration: 60,
          },
          {
            id: 11,
            amenityId: 10,
            startTime: '09:00',
            duration: 60,
          },
        ],
      },
    ]);
  });
});
