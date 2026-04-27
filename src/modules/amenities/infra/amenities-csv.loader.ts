import { loadCsv } from '../../../shared/utils/csv-loader';
import { type ValidationError } from '../../../shared/types/validation.types';
import { validateAmenities } from '../amenities.validator';
import { type Amenity, type AmenityRow } from '../amenities.types';

export interface AmenitiesCsvLoadResult {
  entities: Amenity[];
  missingFile: boolean;
  warning?: string;
  validationIssues: ValidationError[];
}

function mapAmenityRow(row: AmenityRow): Amenity {
  return {
    id: Number(row.id),
    name: row.name,
  };
}

export async function loadAmenitiesFromCsv(filePath: string): Promise<AmenitiesCsvLoadResult> {
  const { rows, missingFile, warning } = await loadCsv<AmenityRow>(filePath);
  const entities = rows.map((row) => mapAmenityRow(row));
  const validationIssues = validateAmenities(entities);

  return {
    entities,
    missingFile,
    warning,
    validationIssues,
  };
}
