import type { Server } from 'node:http';
import { createApp } from './app';
import { env } from './env';
import { logger } from './logger';

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function startServer(): Server {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Server started');
  });

  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, 'Shutting down');

    try {
      await closeServer(server);

      // TODO: Close database connections, Redis clients, etc. here
      // await prisma.$disconnect();
      // await redis.quit();

      logger.info('Shutdown completed');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Shutdown failed');
      process.exit(1);
    }
  };

  // OS signals
  process.on('SIGINT', (signal) => {
    void shutdown(signal);
  });

  process.on('SIGTERM', (signal) => {
    void shutdown(signal);
  });

  // Fatal errors
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled rejection');
    process.exit(1);
  });

  return server;
}
