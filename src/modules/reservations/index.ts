import { type Router } from 'express';
import { InMemoryReservationsRepository } from './reservations.in-memory.repository';
import { type ReservationsRepositoryPort } from './reservations.repository.port';
import { createReservationsRouter } from './reservations.routes';
import { type AmenitiesRepositoryPort } from '../amenities/amenities.repository.port';

export function createReservationsRepository(): ReservationsRepositoryPort {
  return new InMemoryReservationsRepository();
}

interface ReservationsRouterDeps {
  reservationsRepo: ReservationsRepositoryPort;
  amenitiesRepo: AmenitiesRepositoryPort;
}

export { InMemoryReservationsRepository };

export function createReservationsModuleRouter({
  reservationsRepo,
  amenitiesRepo,
}: ReservationsRouterDeps): Router {
  return createReservationsRouter({ reservationsRepo, amenitiesRepo });
}

export type { Reservation, ReservationRow } from './reservations.types';
export type { ReservationsRepositoryPort } from './reservations.repository.port';
