import { type Router } from 'express';
import { InMemoryReservationsRepository } from './infra/reservations.in-memory.repository';
import { createReservationsRouter } from './reservations.routes';
import { type ReservationsController } from './reservations.controller';
import { type Reservation } from './reservations.types';

export function createInMemoryReservationsRepository(
  reservations: readonly Reservation[] = [],
): InMemoryReservationsRepository {
  const repository = new InMemoryReservationsRepository();
  repository.replaceAll(reservations);
  return repository;
}

export { createReservationsService } from './reservations.service';
export { createReservationsController } from './reservations.controller';
export { loadReservationsFromCsv } from './infra/reservations-csv.loader';

export function createReservationsModuleRouter(controller: ReservationsController): Router {
  return createReservationsRouter({ controller });
}

export type { Reservation, ReservationRow } from './reservations.types';
export type { ReservationsRepositoryPort } from './reservations.repository.port';
export type { ReservationsCsvLoadResult } from './infra/reservations-csv.loader';
export type { ReservationsService } from './reservations.service';
export type { ReservationsController } from './reservations.controller';
