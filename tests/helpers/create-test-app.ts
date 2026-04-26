import path from 'node:path';
import { createApp } from '../../src/app/app';
import { InMemoryAmenitiesRepository } from '../../src/modules/amenities';
import { InMemoryReservationsRepository } from '../../src/modules/reservations';

export async function createTestApp() {
  const amenitiesRepo = new InMemoryAmenitiesRepository();
  const reservationsRepo = new InMemoryReservationsRepository();

  const amenitiesCsvPath = path.resolve(__dirname, '../fixtures/amenities.csv');
  const reservationsCsvPath = path.resolve(__dirname, '../fixtures/reservations.csv');

  await amenitiesRepo.load(amenitiesCsvPath);
  await reservationsRepo.load(reservationsCsvPath);

  return createApp({ amenitiesRepo, reservationsRepo });
}
