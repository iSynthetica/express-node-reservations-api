import { loadCsv } from '../../../shared/utils/csv-loader';
import { type ValidationError } from '../../../shared/types/validation.types';
import { validateReservations } from '../reservations.validator';
import { type Reservation, type ReservationRow } from '../reservations.types';

export interface ReservationsCsvLoadResult {
  entities: Reservation[];
  missingFile: boolean;
  warning?: string;
  validationIssues: ValidationError[];
}

function mapReservationRow(row: ReservationRow): Reservation {
  return {
    id: Number(row.id),
    amenityId: Number(row.amenity_id),
    userId: Number(row.user_id),
    startTime: Number(row.start_time),
    endTime: Number(row.end_time),
    date: Number(row.date),
  };
}

export async function loadReservationsFromCsv(
  filePath: string,
): Promise<ReservationsCsvLoadResult> {
  const { rows, missingFile, warning } = await loadCsv<ReservationRow>(filePath);
  const entities = rows.map((row) => mapReservationRow(row));
  const validationIssues = validateReservations(entities);

  return {
    entities,
    missingFile,
    warning,
    validationIssues,
  };
}
