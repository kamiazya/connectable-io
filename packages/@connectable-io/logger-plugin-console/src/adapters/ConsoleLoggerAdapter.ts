import { Logger } from '@connectable-io/logger'

export class ConsoleLoggerAdapter implements Logger {
  constructor(public readonly name: string, public globalLogFields: Record<string, any> = {}) {}

  log(message: string, context: Record<string, any> = {}) {
    console.log(`${message}@${this.name}`, {
      ...context,
      ...this.globalLogFields,
    })
  }
  debug(message: string, context: Record<string, any> = {}) {
    console.debug(`${message}@${this.name}`, {
      ...context,
      ...this.globalLogFields,
    })
  }
  info(message: string, context: Record<string, any> = {}) {
    console.info(`${message}@${this.name}`, {
      ...context,
      ...this.globalLogFields,
    })
  }
  notice(message: string, context: Record<string, any> = {}) {
    console.info(`${message}@${this.name}`, {
      ...context,
      ...this.globalLogFields,
    })
  }
  warn(message: string, context: Record<string, any> = {}) {
    console.warn(`${message}@${this.name}`, {
      ...context,
      ...this.globalLogFields,
    })
  }
  error(message: string, context: Record<string, any> = {}) {
    console.error(`${message}@${this.name}`, {
      ...context,
      ...this.globalLogFields,
    })
  }
  setContext(context: Record<string, any>) {
    this.globalLogFields = { ...this.globalLogFields, ...context }
  }
  createChild(name: string, context: Record<string, any> = {}) {
    return new ConsoleLoggerAdapter(name, { ...this.globalLogFields, ...context })
  }
}
