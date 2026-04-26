import 'dotenv/config';
import { z } from 'zod';

function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3200),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().min(1).default('express-ts-starter'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FILE_PATH: z.string().min(1).default('./logs/app.log'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  AMENITIES_CSV_PATH: z.string().min(1).default('data/Amenity.csv'),
  RESERVATIONS_CSV_PATH: z.string().min(1).default('data/Reservations.csv'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGIN === '*' ? ['*'] : parseCorsOrigins(env.CORS_ORIGIN);
