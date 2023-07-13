import { Logger } from '@pluggable-io/logger'

declare module '@pluggable-io/logger' {
  type URLString = `console:`

  export interface LoggerStatic {
    /**
     * Build a logger from a URL
     *
     * @example use console as logger
     *
     * ```ts
     * import { Logger } from '@pluggable-io/logger';
     * import '@pluggable-io/logger-plugin-console';
     *
     * const logger = await Logger.from('console:');
     * ```
     **/
    from(url: URLString): Promise<Logger>
  }
}

export class ConsoleLogger implements Logger {
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
    return new ConsoleLogger(name, { ...this.globalLogFields, ...context })
  }
}

Logger.registerPlugin('console:', {
  async build(url) {
    return new ConsoleLogger(url.toString())
  },
})
