import { Router } from 'express';
import { type ReservationsRepositoryPort } from './reservations.repository.port';
import { type AmenitiesRepositoryPort } from '../amenities/amenities.repository.port';
import { createReservationsController } from './reservations.controller';
import { validateRequest } from '../../shared/middleware/validate-request.middleware';
import { getByAmenitySchema, getByUserSchema } from './reservations.schemas';

interface ReservationsRouterDeps {
  reservationsRepo: ReservationsRepositoryPort;
  amenitiesRepo: AmenitiesRepositoryPort;
}

export function createReservationsRouter({
  reservationsRepo,
  amenitiesRepo,
}: ReservationsRouterDeps): Router {
  const router = Router();
  const controller = createReservationsController({ reservationsRepo, amenitiesRepo });

  router.get(
    '/amenities/:amenityId/reservations',
    validateRequest(getByAmenitySchema),
    controller.getByAmenityAndDate,
  );

  router.get('/users/:userId/reservations', validateRequest(getByUserSchema), controller.getByUser);

  return router;
}
