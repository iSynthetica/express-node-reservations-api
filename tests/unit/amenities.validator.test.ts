import { describe, expect, it } from 'vitest';
import { validateAmenities } from '../../src/modules/amenities/amenities.validator';

describe('amenities.validator', () => {
  it('returns no validation issues for valid amenities', () => {
    const errors = validateAmenities([
      { id: 1, name: 'Gym' },
      { id: 2, name: 'Sauna' },
    ]);

    expect(errors).toEqual([]);
  });

  it('returns validation issues for invalid amenity fields', () => {
    const errors = validateAmenities([
      { id: Number.NaN, name: '' },
      { id: 2, name: '   ' },
    ]);

    expect(errors).toEqual([
      { entity: 'amenity', id: 0, reason: 'invalid or missing id' },
      { entity: 'amenity', id: Number.NaN, reason: 'missing name' },
      { entity: 'amenity', id: 2, reason: 'missing name' },
    ]);
  });
});
