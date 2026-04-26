import { type Amenity } from './amenities.types';

export interface AmenitiesRepositoryPort {
  getAll(): Promise<Amenity[]>;
  getById(id: number): Promise<Amenity | null>;
}
