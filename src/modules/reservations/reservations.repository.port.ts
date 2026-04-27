import { type Reservation } from './reservations.types';

export interface ReservationsRepositoryPort {
  findByAmenityAndDate(amenityId: number, date: number): Promise<readonly Reservation[]>;
  findByUserId(userId: number): Promise<readonly Reservation[]>;
}
