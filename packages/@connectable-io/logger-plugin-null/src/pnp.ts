import { Logger } from '@connectable-io/logger'
import { NullLoggerAdapter } from './adapters/NullLogger.js'

type URLString = 'null:'

declare module '@connectable-io/logger' {
  export interface LoggerStatic {
    /**
     * Build a logger from a URL
     *
     * @example use null as logger
     *
     * ```ts
     * import { Logger } from '@connectable-io/logger';
     * import '@connectable-io/logger-plugin-testing';
     *
     * const logger = await Logger.from('null:');
     * ```
     *
     * @example use memory as logger
     *
     * ```ts
     * import { Logger } from '@connectable-io/logger';
     * import '@connectable-io/logger-plugin-memory';
     *
     * const logger = await Logger.from('memory:');
     * ```
     **/
    from(url: URLString): Promise<Logger>
  }
}

Logger.load('null:', {
  async build(url) {
    return new NullLoggerAdapter(url.toString())
  },
})
