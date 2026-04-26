import { InMemoryAmenitiesRepository } from './amenities.in-memory.repository';
import { type AmenitiesRepositoryPort } from './amenities.repository.port';

export function createAmenitiesRepository(): AmenitiesRepositoryPort {
  return new InMemoryAmenitiesRepository();
}

export { InMemoryAmenitiesRepository };

export type { Amenity, AmenityRow } from './amenities.types';
export type { AmenitiesRepositoryPort } from './amenities.repository.port';
