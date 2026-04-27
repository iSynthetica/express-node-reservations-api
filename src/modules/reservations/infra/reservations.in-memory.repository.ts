import { type ReservationsRepositoryPort } from '../reservations.repository.port';
import { type Reservation } from '../reservations.types';
import { ReservationsInMemoryStore } from './reservations.in-memory.store';

export class InMemoryReservationsRepository implements ReservationsRepositoryPort {
  constructor(
    private readonly store: ReservationsInMemoryStore = new ReservationsInMemoryStore(),
  ) {}

  getAll(): readonly Reservation[] {
    return this.store.getAll();
  }

  findByAmenityAndDate(amenityId: number, date: number): Promise<readonly Reservation[]> {
    return Promise.resolve(
      this.store
        .getAll()
        .filter((reservation) => reservation.amenityId === amenityId && reservation.date === date),
    );
  }

  findByUserId(userId: number): Promise<readonly Reservation[]> {
    return Promise.resolve(
      this.store.getAll().filter((reservation) => reservation.userId === userId),
    );
  }

  replaceAll(reservations: readonly Reservation[]): void {
    this.store.replaceAll(reservations);
  }
}
