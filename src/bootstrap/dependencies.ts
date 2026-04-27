import {
  createInMemoryAmenitiesRepository,
  type AmenitiesRepositoryPort,
} from '../modules/amenities';
import {
  createInMemoryReservationsRepository,
  createReservationsModuleRouter,
  createReservationsController,
  createReservationsService,
  type ReservationsController,
  type ReservationsRepositoryPort,
  type ReservationsService,
} from '../modules/reservations';
import { createCsvModuleRouter } from '../modules/csv';
import { authMiddleware, createAuthModuleRouter } from '../modules/auth';
import { createSystemModuleRouter } from '../modules/system';
import { logger } from '../app/logger';
import type { LoggerPort } from '../shared/ports/logger.port';
import type { DataBootstrapResult } from '../app/bootstrap-data';

export interface AppDependencies {
  logger: LoggerPort;
  amenitiesRepo: AmenitiesRepositoryPort;
  reservationsRepo: ReservationsRepositoryPort;
  reservationsService: ReservationsService;
  reservationsController: ReservationsController;
  reservationsRouter: ReturnType<typeof createReservationsModuleRouter>;
  csvRouter: ReturnType<typeof createCsvModuleRouter>;
  authRouter: ReturnType<typeof createAuthModuleRouter>;
  systemRouter: ReturnType<typeof createSystemModuleRouter>;
}

export function createDependencies(data: DataBootstrapResult): AppDependencies {
  const amenitiesRepo = createInMemoryAmenitiesRepository(data.amenities);
  const reservationsRepo = createInMemoryReservationsRepository(data.reservations);

  const reservationsService = createReservationsService({
    amenitiesRepo,
    reservationsRepo,
    logger,
  });

  const reservationsController = createReservationsController({
    reservationsService,
  });

  const reservationsRouter = createReservationsModuleRouter(reservationsController);
  const systemRouter = createSystemModuleRouter();

  const csvRouter = createCsvModuleRouter({ authMiddleware });
  const authRouter = createAuthModuleRouter();

  return {
    logger,
    amenitiesRepo,
    reservationsRepo,
    reservationsService,
    reservationsController,
    reservationsRouter,
    csvRouter,
    authRouter,
    systemRouter,
  };
}
