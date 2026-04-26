import rateLimit, { type Options } from 'express-rate-limit';
import { env } from './env';

const windowMs: number = env.RATE_LIMIT_WINDOW_MS;
const limit: number = env.RATE_LIMIT_MAX_REQUESTS;

const rateLimitOptions: Partial<Options> = {
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many requests, please try again later.',
  },
};

export const apiRateLimit = rateLimit(rateLimitOptions);
