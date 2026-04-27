import { randomUUID } from 'node:crypto';
import type { Request, RequestHandler, Response } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../../app/logger';

type RequestWithId = Request & {
  id?: string | number;
};

function getSocketDetails(req: Request): { remoteAddress?: string; remotePort?: number } {
  const socket: unknown = Reflect.get(req, 'socket');

  if (!socket || typeof socket !== 'object') {
    return {};
  }

  const remoteAddress =
    'remoteAddress' in socket && typeof socket.remoteAddress === 'string'
      ? socket.remoteAddress
      : undefined;

  const remotePort =
    'remotePort' in socket && typeof socket.remotePort === 'number' ? socket.remotePort : undefined;

  return { remoteAddress, remotePort };
}

const httpLoggerInstance = pinoHttp({
  logger,

  genReqId(req, res) {
    const incomingRequestId = req.headers['x-request-id'];

    const requestId =
      typeof incomingRequestId === 'string' && incomingRequestId.trim().length > 0
        ? incomingRequestId
        : randomUUID();

    res.setHeader('X-Request-Id', requestId);

    return requestId;
  },

  autoLogging: {
    ignore: (req: Request) => req.url === '/metrics' || req.url === '/health',
  },

  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (err || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },

  customReceivedMessage: () => 'request started',

  customSuccessMessage: () => 'request completed',

  customErrorMessage: () => 'request failed',

  customProps(req: RequestWithId, res: Response) {
    return {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
    };
  },

  serializers: {
    req(req: RequestWithId) {
      const { remoteAddress, remotePort } = getSocketDetails(req);

      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress,
        remotePort,
      };
    },
    res(res: Response) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

export const httpLogger = httpLoggerInstance as RequestHandler;
