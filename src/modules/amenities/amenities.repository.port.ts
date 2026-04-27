import { type Amenity } from './amenities.types';

export interface AmenitiesRepositoryPort {
  findById(id: number): Promise<Amenity | null>;
}
