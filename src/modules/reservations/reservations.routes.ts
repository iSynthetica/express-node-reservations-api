import { Router } from 'express';
import { type ReservationsController } from './reservations.controller';
import { validateRequest } from '../../shared/middleware/validate-request.middleware';
import { getByAmenitySchema, getByUserSchema } from './reservations.schemas';

interface ReservationsRouterDeps {
  controller: ReservationsController;
}

export function createReservationsRouter({ controller }: ReservationsRouterDeps): Router {
  const router = Router();

  router.get(
    '/amenities/:amenityId/reservations',
    validateRequest(getByAmenitySchema),
    controller.getByAmenityAndDate,
  );

  router.get('/users/:userId/reservations', validateRequest(getByUserSchema), controller.getByUser);

  return router;
}
