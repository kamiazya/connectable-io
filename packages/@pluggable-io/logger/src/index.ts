export interface Logger {
  name: string
  log(message: string, context?: Record<string, any>): void
  debug(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  notice(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  setContext(context: Record<string, any>): void
  createChild(name: string, context?: Record<string, any>): Logger
}
