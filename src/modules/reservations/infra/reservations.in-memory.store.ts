import { type Reservation } from '../reservations.types';

export class ReservationsInMemoryStore {
  private reservations: Reservation[] = [];

  getAll(): readonly Reservation[] {
    return [...this.reservations];
  }

  replaceAll(reservations: readonly Reservation[]): void {
    this.reservations = [...reservations];
  }
}
