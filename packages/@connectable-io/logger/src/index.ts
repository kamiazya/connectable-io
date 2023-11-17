import { Registry, URLProtocolBasedRegistry } from '@connectable-io/core'

/**
 * Logger is a pluggable interface for logging.
 */
export interface Logger {
  name: string
  log(message: string, context?: Record<string, any>): void
  debug(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  notice(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  /**
   * Set context for all logs.
   *
   * @param context
   */
  setContext(context: Record<string, any>): void
  /**
   * Create a child logger.
   * @param name Logger name
   * @param context Context for all logs of child logger
   */
  createChild(name: string, context?: Record<string, any>): Logger
}

/**
 * LoggerStatic is a pluggable interface for logger.
 */
export interface LoggerStatic extends Registry<Logger> {}
export const Logger: LoggerStatic = new (class LoggerRegistry extends URLProtocolBasedRegistry<Logger> {
  constructor() {
    super('Logger')
  }
})()
