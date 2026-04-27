import { type Amenity } from '../amenities.types';

export class AmenitiesInMemoryStore {
  private amenities: Amenity[] = [];

  getAll(): readonly Amenity[] {
    return [...this.amenities];
  }

  replaceAll(amenities: readonly Amenity[]): void {
    this.amenities = [...amenities];
  }
}
