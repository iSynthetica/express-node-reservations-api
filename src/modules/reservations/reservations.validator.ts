import { type Reservation } from './reservations.types';
import { type ValidationError } from '../../shared/types/validation.types';

export function validateReservations(reservations: Reservation[]): ValidationError[] {
  const errors: ValidationError[] = [];

  reservations.forEach((r) => {
    if (!r.id || isNaN(r.id)) {
      errors.push({ entity: 'reservation', id: r.id, reason: 'invalid or missing id' });
    }
    if (!r.amenityId || isNaN(r.amenityId)) {
      errors.push({ entity: 'reservation', id: r.id, reason: 'invalid amenity_id' });
    }
    if (!r.userId || isNaN(r.userId)) {
      errors.push({ entity: 'reservation', id: r.id, reason: 'invalid user_id' });
    }
    if (isNaN(r.startTime) || isNaN(r.endTime)) {
      errors.push({ entity: 'reservation', id: r.id, reason: 'invalid start_time or end_time' });
    }
    if (r.startTime >= r.endTime) {
      errors.push({
        entity: 'reservation',
        id: r.id,
        reason: `start_time (${String(r.startTime)}) must be less than end_time (${String(r.endTime)})`,
      });
    }
    if (isNaN(r.date)) {
      errors.push({ entity: 'reservation', id: r.id, reason: 'invalid date timestamp' });
    }
  });

  return errors;
}
