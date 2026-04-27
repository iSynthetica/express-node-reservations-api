export interface LoggerPort {
  debug(payload: unknown, message?: string): void;
  info(payload: unknown, message?: string): void;
  error(payload: unknown, message?: string): void;
  warn(payload: unknown, message?: string): void;
}
