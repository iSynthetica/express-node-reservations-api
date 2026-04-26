import { type Request, type Response } from 'express';
import { type AmenitiesRepositoryPort } from '../amenities/amenities.repository.port';
import { type ReservationsRepositoryPort } from './reservations.repository.port';
import { calcDuration, minutesToTime, timestampToDateString } from '../../shared/utils/date-time';

interface ReservationsControllerDeps {
  reservationsRepo: ReservationsRepositoryPort;
  amenitiesRepo: AmenitiesRepositoryPort;
}

export function createReservationsController({
  reservationsRepo,
  amenitiesRepo,
}: ReservationsControllerDeps) {
  return {
    getByAmenityAndDate: async (req: Request, res: Response): Promise<void> => {
      const amenityId = Number(req.params.amenityId);
      const date = Number(req.query.date);

      if (!Number.isFinite(amenityId) || !Number.isFinite(date)) {
        res.status(400).json({ error: 'Validation failed' });
        return;
      }

      const amenity = await amenitiesRepo.getById(amenityId);
      if (!amenity) {
        res.status(404).json({ error: 'Amenity not found' });
        return;
      }

      const reservations = await reservationsRepo.getByAmenityAndDate(amenityId, date);
      reservations.sort((a, b) => a.startTime - b.startTime);

      res.status(200).json(
        reservations.map((r) => ({
          id: r.id,
          userId: r.userId,
          startTime: minutesToTime(r.startTime),
          duration: calcDuration(r.startTime, r.endTime),
          amenityName: amenity.name,
        })),
      );
    },

    getByUser: async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.userId);

      if (!Number.isFinite(userId)) {
        res.status(400).json({ error: 'Validation failed' });
        return;
      }

      const reservations = await reservationsRepo.getByUserId(userId);

      const grouped = new Map<number, typeof reservations>();
      reservations.forEach((r) => {
        const arr = grouped.get(r.date) ?? [];
        arr.push(r);
        grouped.set(r.date, arr);
      });

      const result = Array.from(grouped.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([date, items]) => ({
          date: timestampToDateString(date),
          reservations: items
            .sort((a, b) => a.startTime - b.startTime)
            .map((r) => ({
              id: r.id,
              amenityId: r.amenityId,
              startTime: minutesToTime(r.startTime),
              duration: calcDuration(r.startTime, r.endTime),
            })),
        }));

      res.status(200).json(result);
    },
  };
}
