import { InMemoryAmenitiesRepository } from './amenities.in-memory.repository';
import { type AmenitiesRepositoryPort } from './amenities.repository.port';

export function createAmenitiesRepository(): AmenitiesRepositoryPort {
  return new InMemoryAmenitiesRepository();
}

// optional explicit export if needed for bootstrap-only concrete usage
export { InMemoryAmenitiesRepository };

export type { Amenity, AmenityRow } from './amenities.types';
export type { AmenitiesRepositoryPort } from './amenities.repository.port';
