import fs from 'node:fs';
import path from 'node:path';
import pino, { type LoggerOptions, type StreamEntry } from 'pino';
import { env } from './env';

const isProduction = env.NODE_ENV === 'production';

function ensureLogDirectory(filePath: string): void {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
}

ensureLogDirectory(env.LOG_FILE_PATH);

const streams: StreamEntry[] = [
  {
    stream: isProduction
      ? process.stdout
      : pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore:
              'pid,hostname,req,res,service,env,requestId,method,url,statusCode,responseTime,port,signal',
            messageFormat:
              '{msg}{if requestId} | reqId={requestId}{end}{if method} | {method}{end}{if url} {url}{end}{if statusCode} -> {statusCode}{end}{if responseTime} | {responseTime}ms{end}{if port} | port={port}{end}{if signal} | signal={signal}{end}',
            singleLine: true,
          },
        }),
  },
  {
    stream: pino.destination({
      dest: env.LOG_FILE_PATH,
      sync: false,
    }),
  },
];

const destination = pino.multistream(streams);

const loggerOptions: LoggerOptions = {
  level: env.LOG_LEVEL,
  base: {
    service: env.APP_NAME,
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
    bindings() {
      return {
        service: env.APP_NAME,
        env: env.NODE_ENV,
      };
    },
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers.set-cookie',
      'headers.authorization',
      'headers.cookie',
      'body.password',
      'body.token',
    ],
    censor: '[REDACTED]',
  },
};

export const logger = pino(loggerOptions, destination);
