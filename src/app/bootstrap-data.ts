import { logger } from './logger';
import { InMemoryAmenitiesRepository } from '../modules/amenities';
import { InMemoryReservationsRepository } from '../modules/reservations';
import { env } from './env';

export interface DataBootstrapResult {
  amenitiesRepo: InMemoryAmenitiesRepository;
  reservationsRepo: InMemoryReservationsRepository;
}

async function validateReservationAmenityLinks(
  reservationsRepo: InMemoryReservationsRepository,
  amenitiesRepo: InMemoryAmenitiesRepository,
): Promise<string[]> {
  const amenities = await amenitiesRepo.getAll();
  const reservations = await reservationsRepo.getAll();
  const amenityIds = new Set(amenities.map((a) => a.id));
  return reservations
    .filter((r) => !amenityIds.has(r.amenityId))
    .map((r) => `reservation ${String(r.id)} references missing amenity_id ${String(r.amenityId)}`);
}

export async function bootstrapData(): Promise<DataBootstrapResult> {
  const amenitiesRepo = new InMemoryAmenitiesRepository();
  const reservationsRepo = new InMemoryReservationsRepository();

  const amenitiesPath = env.AMENITIES_CSV_PATH;
  const reservationsPath = env.RESERVATIONS_CSV_PATH;

  const amenitiesLoad = await amenitiesRepo.load(amenitiesPath);
  const reservationsLoad = await reservationsRepo.load(reservationsPath);

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

  const amenityErrors = amenitiesRepo.validate();
  const reservationErrors = reservationsRepo.validate();
  const linkErrors = await validateReservationAmenityLinks(reservationsRepo, amenitiesRepo);

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
      amenitiesCount: (await amenitiesRepo.getAll()).length,
      reservationsCount: (await reservationsRepo.getAll()).length,
    },
    'CSV in-memory bootstrap completed',
  );

  return { amenitiesRepo, reservationsRepo };
}
