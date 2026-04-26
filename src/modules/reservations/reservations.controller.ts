import { type Request, type Response } from 'express';
import { type AmenitiesRepositoryPort } from '../amenities/amenities.repository.port';
import { type ReservationsRepositoryPort } from './reservations.repository.port';
import { createReservationsService } from './reservations.service';

interface ReservationsControllerDeps {
  reservationsRepo: ReservationsRepositoryPort;
  amenitiesRepo: AmenitiesRepositoryPort;
}

export function createReservationsController({
  reservationsRepo,
  amenitiesRepo,
}: ReservationsControllerDeps) {
  const reservationsService = createReservationsService({ reservationsRepo, amenitiesRepo });

  return {
    getByAmenityAndDate: async (req: Request, res: Response): Promise<void> => {
      const amenityId = Number(req.params.amenityId);
      const date = Number(req.query.date);

      const result = await reservationsService.getAmenityReservations(amenityId, date);
      if (result.status === 'not_found') {
        res.status(404).json({ error: 'Amenity not found' });
        return;
      }

      res.status(200).json(result.data);
    },

    getByUser: async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.userId);
      res.status(200).json(await reservationsService.getUserReservations(userId));
    },
  };
}
