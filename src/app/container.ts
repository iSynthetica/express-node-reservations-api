import type { DataBootstrapResult } from './bootstrap-data';
import { createDependencies } from '../bootstrap/dependencies';

export function createAppContainer(data: DataBootstrapResult) {
  return {
    dependencies: {
      logger: createDependencies(data).logger,
    },
    routers: {
      reservationsRouter: createDependencies(data).reservationsRouter,
      systemRouter: createDependencies(data).systemRouter,
      csvRouter: createDependencies(data).csvRouter,
      authRouter: createDependencies(data).authRouter,
    },
  };
}
