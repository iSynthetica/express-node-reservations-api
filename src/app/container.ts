import {
  createInMemoryAmenitiesRepository,
  type AmenitiesRepositoryPort,
} from '../modules/amenities';
import {
  createInMemoryReservationsRepository,
  createReservationsController,
  createReservationsModuleRouter,
  createReservationsService,
  type ReservationsController,
  type ReservationsRepositoryPort,
  type ReservationsService,
} from '../modules/reservations';
import { createSystemModuleRouter } from '../modules/system';
import { appMetricsReader } from './metrics-reader.adapter';
import { type DataBootstrapResult } from './bootstrap-data';
import { logger } from './logger';
import { type LoggerPort } from '../shared/ports/logger.port';

export interface AppContainer {
  dependencies: {
    logger: LoggerPort;
  };
  repositories: {
    amenitiesRepo: AmenitiesRepositoryPort;
    reservationsRepo: ReservationsRepositoryPort;
  };
  services: {
    reservationsService: ReservationsService;
  };
  controllers: {
    reservationsController: ReservationsController;
  };
  routers: {
    reservationsRouter: ReturnType<typeof createReservationsModuleRouter>;
    systemRouter: ReturnType<typeof createSystemModuleRouter>;
  };
}

export function createAppContainer(data: DataBootstrapResult): AppContainer {
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
  const systemRouter = createSystemModuleRouter({
    metricsReader: appMetricsReader,
  });

  return {
    dependencies: {
      logger,
    },
    repositories: {
      amenitiesRepo,
      reservationsRepo,
    },
    services: {
      reservationsService,
    },
    controllers: {
      reservationsController,
    },
    routers: {
      reservationsRouter,
      systemRouter,
    },
  };
}
