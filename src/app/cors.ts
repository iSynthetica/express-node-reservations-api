import type { CorsOptions } from 'cors';
import { corsOrigins } from './env';

const allowAllCorsOrigins = corsOrigins.includes('*');
const allowedCorsOrigins = new Set<string>(corsOrigins);

function isCorsOriginAllowed(origin: string): boolean {
  return allowAllCorsOrigins || allowedCorsOrigins.has(origin);
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isCorsOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
};
