import { type AmenitiesRepositoryPort } from '../amenities.repository.port';
import { type Amenity } from '../amenities.types';
import { AmenitiesInMemoryStore } from './amenities.in-memory.store';

export class InMemoryAmenitiesRepository implements AmenitiesRepositoryPort {
  constructor(private readonly store: AmenitiesInMemoryStore = new AmenitiesInMemoryStore()) {}

  async findById(id: number): Promise<Amenity | null> {
    return Promise.resolve(this.store.getAll().find((amenity) => amenity.id === id) ?? null);
  }

  getAll(): readonly Amenity[] {
    return this.store.getAll();
  }

  replaceAll(amenities: readonly Amenity[]): void {
    this.store.replaceAll(amenities);
  }
}
