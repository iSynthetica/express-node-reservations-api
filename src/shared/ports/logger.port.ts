export interface LoggerPort {
  error(payload: unknown, message?: string): void;
  warn(payload: unknown, message?: string): void;
}
