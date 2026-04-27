import { logger } from './logger';
import { loadAmenitiesFromCsv, type Amenity } from '../modules/amenities';
import { loadReservationsFromCsv, type Reservation } from '../modules/reservations';
import { env } from './env';

export interface DataBootstrapResult {
  amenities: Amenity[];
  reservations: Reservation[];
}

function validateReservationAmenityLinks(
  reservations: readonly Reservation[],
  amenities: readonly Amenity[],
): string[] {
  const amenityIds = new Set(amenities.map((a) => a.id));
  return reservations
    .filter((r) => !amenityIds.has(r.amenityId))
    .map((r) => `reservation ${String(r.id)} references missing amenity_id ${String(r.amenityId)}`);
}

export async function bootstrapData(): Promise<DataBootstrapResult> {
  const amenitiesPath = env.AMENITIES_CSV_PATH;
  const reservationsPath = env.RESERVATIONS_CSV_PATH;

  const amenitiesLoad = await loadAmenitiesFromCsv(amenitiesPath);
  const reservationsLoad = await loadReservationsFromCsv(reservationsPath);

  if (amenitiesLoad.missingFile) {
    logger.warn(
      { filePath: amenitiesPath, warning: amenitiesLoad.warning },
      'Amenities CSV missing',
    );
  }

  if (reservationsLoad.missingFile) {
    logger.warn(
      { filePath: reservationsPath, warning: reservationsLoad.warning },
      'Reservations CSV missing',
    );
  }

  const amenityErrors = amenitiesLoad.validationIssues;
  const reservationErrors = reservationsLoad.validationIssues;
  const linkErrors = validateReservationAmenityLinks(
    reservationsLoad.entities,
    amenitiesLoad.entities,
  );

  if (amenityErrors.length > 0) {
    logger.warn(
      { count: amenityErrors.length, sample: amenityErrors.slice(0, 5) },
      'Amenity validation issues',
    );
  }

  if (reservationErrors.length > 0) {
    logger.warn(
      { count: reservationErrors.length, sample: reservationErrors.slice(0, 5) },
      'Reservation validation issues',
    );
  }

  if (linkErrors.length > 0) {
    logger.warn(
      { count: linkErrors.length, sample: linkErrors.slice(0, 5) },
      'Reservation-amenity integrity issues',
    );
  }

  logger.info(
    {
      amenitiesCount: amenitiesLoad.entities.length,
      reservationsCount: reservationsLoad.entities.length,
    },
    'CSV in-memory bootstrap completed',
  );

  return {
    amenities: amenitiesLoad.entities,
    reservations: reservationsLoad.entities,
  };
}
