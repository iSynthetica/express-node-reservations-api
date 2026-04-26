import { startServer } from './app/server';
import { bootstrapData } from './app/bootstrap-data';
import { logger } from './app/logger';

async function main(): Promise<void> {
  try {
    const data = await bootstrapData();
    startServer(data);
  } catch (err) {
    logger.error({ err }, 'Startup failed during data bootstrap');
    process.exit(1);
  }
}

void main();
