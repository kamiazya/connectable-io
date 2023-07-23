import { Logger } from '@pluggable-io/logger'

export class NullLoggerAdapter implements Logger {
  constructor(public readonly name: string) {}

  log(message: string, context: Record<string, any> = {}) {}
  debug(message: string, context: Record<string, any> = {}) {}
  info(message: string, context: Record<string, any> = {}) {}
  notice(message: string, context: Record<string, any> = {}) {}
  warn(message: string, context: Record<string, any> = {}) {}
  error(message: string, context: Record<string, any> = {}) {}
  setContext(context: Record<string, any>) {}
  createChild(name: string, context: Record<string, any> = {}) {
    return new NullLoggerAdapter(name)
  }
}
