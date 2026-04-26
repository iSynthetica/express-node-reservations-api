import { loadCsv } from '../../shared/utils/csv-loader';
import { type Reservation, type ReservationRow } from './reservations.types';
import { validateReservations } from './reservations.validator';
import { type ValidationError } from '../../shared/types/validation.types';
import { type ReservationsRepositoryPort } from './reservations.repository.port';

export interface ReservationsLoadMeta {
  missingFile: boolean;
  warning?: string;
}

export class InMemoryReservationsRepository implements ReservationsRepositoryPort {
  private reservations: Reservation[] = [];

  private parseRow(row: ReservationRow): Reservation {
    return {
      id: Number(row.id),
      amenityId: Number(row.amenity_id),
      userId: Number(row.user_id),
      startTime: Number(row.start_time),
      endTime: Number(row.end_time),
      date: Number(row.date),
    };
  }

  async load(filePath: string): Promise<ReservationsLoadMeta> {
    const { rows, missingFile, warning } = await loadCsv<ReservationRow>(filePath);

    if (missingFile) {
      this.reservations = [];
      return { missingFile, warning };
    }

    this.reservations = rows.map((row) => this.parseRow(row));
    return { missingFile: false };
  }

  validate(): ValidationError[] {
    return validateReservations(this.reservations);
  }

  async getAll(): Promise<Reservation[]> {
    return Promise.resolve(this.reservations);
  }

  getByAmenityAndDate(amenityId: number, date: number): Promise<Reservation[]> {
    return Promise.resolve(
      this.reservations.filter((r) => r.amenityId === amenityId && r.date === date),
    );
  }

  getByUserId(userId: number): Promise<Reservation[]> {
    return Promise.resolve(this.reservations.filter((r) => r.userId === userId));
  }
}
