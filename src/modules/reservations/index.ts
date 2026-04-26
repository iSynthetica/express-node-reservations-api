import { InMemoryReservationsRepository } from './reservations.repository';
import { type ReservationsRepositoryPort } from './reservations.repository.port';

export function createReservationsRepository(): ReservationsRepositoryPort {
  return new InMemoryReservationsRepository();
}

// optional explicit export if needed for bootstrap-only concrete usage
export { InMemoryReservationsRepository };

export type { Reservation, ReservationRow } from './reservations.types';
export type { ReservationsRepositoryPort } from './reservations.repository.port';
