import { startServer } from './app/server';
import { bootstrapData } from './app/bootstrap-data';
import { logger } from './app/logger';

async function main(): Promise<void> {
  try {
    await bootstrapData();
    startServer();
  } catch (err) {
    logger.error({ err }, 'Startup failed during data bootstrap');
    process.exit(1);
  }
}

void main();
