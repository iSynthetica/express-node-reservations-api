import { loadCsv } from '../../shared/utils/csv-loader';
import { type Amenity, type AmenityRow } from './amenities.types';
import { validateAmenities } from './amenities.validator';
import { type ValidationError } from '../../shared/types/validation.types';
import { type AmenitiesRepositoryPort } from './amenities.repository.port';

export interface AmenitiesLoadMeta {
  missingFile: boolean;
  warning?: string;
}

export class InMemoryAmenitiesRepository implements AmenitiesRepositoryPort {
  private amenities: Amenity[] = [];

  private parseRow(row: AmenityRow): Amenity {
    return {
      id: Number(row.id),
      name: row.name,
    };
  }

  async load(filePath: string): Promise<AmenitiesLoadMeta> {
    const { rows, missingFile, warning } = await loadCsv<AmenityRow>(filePath);

    if (missingFile) {
      this.amenities = [];
      return { missingFile, warning };
    }

    this.amenities = rows.map((row) => this.parseRow(row));
    return { missingFile: false };
  }

  validate(): ValidationError[] {
    return validateAmenities(this.amenities);
  }

  async getAll(): Promise<Amenity[]> {
    return Promise.resolve(this.amenities);
  }

  async getById(id: number): Promise<Amenity | null> {
    return Promise.resolve(this.amenities.find((a) => a.id === id) ?? null);
  }
}
