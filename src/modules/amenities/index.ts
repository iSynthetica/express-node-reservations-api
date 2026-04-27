import { InMemoryAmenitiesRepository } from './infra/amenities.in-memory.repository';
import { type Amenity } from './amenities.types';

export function createInMemoryAmenitiesRepository(
  amenities: readonly Amenity[] = [],
): InMemoryAmenitiesRepository {
  const repository = new InMemoryAmenitiesRepository();
  repository.replaceAll(amenities);
  return repository;
}

export { loadAmenitiesFromCsv } from './infra/amenities-csv.loader';

export type { Amenity, AmenityRow } from './amenities.types';
export type { AmenitiesRepositoryPort } from './amenities.repository.port';
export type { AmenitiesCsvLoadResult } from './infra/amenities-csv.loader';
