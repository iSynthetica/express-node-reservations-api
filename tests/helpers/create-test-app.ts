import path from 'node:path';
import { createApp } from '../../src/app/app';
import { loadAmenitiesFromCsv } from '../../src/modules/amenities';
import { loadReservationsFromCsv } from '../../src/modules/reservations';
import type { AuthRepositoryPort } from '../../src/modules/auth';

export interface TestAppOptions {
  authRepository?: AuthRepositoryPort;
}

export async function createTestApp(options: TestAppOptions = {}) {
  const amenitiesCsvPath = path.resolve(__dirname, '../fixtures/amenities.csv');
  const reservationsCsvPath = path.resolve(__dirname, '../fixtures/reservations.csv');

  const amenitiesLoad = await loadAmenitiesFromCsv(amenitiesCsvPath);
  const reservationsLoad = await loadReservationsFromCsv(reservationsCsvPath);

  return createApp(
    {
      amenities: amenitiesLoad.entities,
      reservations: reservationsLoad.entities,
    },
    options,
  );
}
