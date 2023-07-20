import { Logger } from '@pluggable-io/logger'

declare module '@pluggable-io/logger' {
  type URLString = `null:` | 'memory:'

  export interface LoggerStatic {
    /**
     * Build a logger from a URL
     *
     * @example use null as logger
     *
     * ```ts
     * import { Logger } from '@pluggable-io/logger';
     * import '@pluggable-io/logger-plugin-testing';
     *
     * const logger = await Logger.from('null:');
     * ```
     *
     * @example use memory as logger
     *
     * ```ts
     * import { Logger } from '@pluggable-io/logger';
     * import '@pluggable-io/logger-plugin-memory';
     *
     * const logger = await Logger.from('memory:');
     * ```
     **/
    from(url: URLString): Promise<Logger>
  }
}

export class NullLogger implements Logger {
  constructor(public readonly name: string) {}

  log(message: string, context: Record<string, any> = {}) {}
  debug(message: string, context: Record<string, any> = {}) {}
  info(message: string, context: Record<string, any> = {}) {}
  notice(message: string, context: Record<string, any> = {}) {}
  warn(message: string, context: Record<string, any> = {}) {}
  error(message: string, context: Record<string, any> = {}) {}
  setContext(context: Record<string, any>) {}
  createChild(name: string, context: Record<string, any> = {}) {
    return new NullLogger(name)
  }
}

export class MemoryLogger implements Logger {
  public logs: any = []
  constructor(public readonly name: string, public globalLogFields: Record<string, any> = {}) {}

  log(message: string, context: Record<string, any> = {}) {
    const entry = Object.assign(
      {
        severity: 'DEFAULT',
        message,
        name: this.name,
      },
      context,
      this.globalLogFields,
    )
    this.logs.push(entry)
  }
  debug(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'DEBUG' })
  }
  info(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'INFO' })
  }
  notice(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'NOTICE' })
  }
  warn(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'WARNING' })
  }
  error(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'ERROR' })
  }
  setContext(context: Record<string, any>) {
    this.globalLogFields = { ...this.globalLogFields, ...context }
  }

  createChild(name: string, context: Record<string, any> = {}): Logger {
    return new MemoryLogger(name, { ...this.globalLogFields, ...context })
  }
}

Logger.registerPlugin('console:', {
  async build(url) {
    return new NullLogger(url.toString())
  },
})

Logger.registerPlugin('memory:', {
  async build(url) {
    return new MemoryLogger(url.toString())
  },
})
