import { Router } from 'express';
import { type ReservationsRepositoryPort } from './reservations.repository.port';
import { type AmenitiesRepositoryPort } from '../amenities/amenities.repository.port';
import { createReservationsController } from './reservations.controller';

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

  router.get('/amenities/:amenityId/reservations', controller.getByAmenityAndDate);

  router.get('/users/:userId/reservations', controller.getByUser);

  return router;
}
