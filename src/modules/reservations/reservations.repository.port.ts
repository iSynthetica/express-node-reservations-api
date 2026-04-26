import { type Reservation } from './reservations.types';

export interface ReservationsRepositoryPort {
  getAll(): Promise<Reservation[]>;
  getByAmenityAndDate(amenityId: number, date: number): Promise<Reservation[]>;
  getByUserId(userId: number): Promise<Reservation[]>;
}
