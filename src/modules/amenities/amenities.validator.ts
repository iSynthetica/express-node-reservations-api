import { type Amenity } from './amenities.types';
import { type ValidationError } from '../../shared/types/validation.types';

export function validateAmenities(amenities: Amenity[]): ValidationError[] {
  const errors: ValidationError[] = [];

  amenities.forEach((a, index) => {
    if (!a.id || isNaN(a.id)) {
      errors.push({ entity: 'amenity', id: index, reason: 'invalid or missing id' });
    }
    if (!a.name || a.name.trim() === '') {
      errors.push({ entity: 'amenity', id: a.id, reason: 'missing name' });
    }
  });

  return errors;
}
