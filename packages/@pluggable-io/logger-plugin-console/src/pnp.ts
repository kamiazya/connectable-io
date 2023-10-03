import { Logger } from '@pluggable-io/logger'
import { ConsoleLoggerAdapter } from './index.js'

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

Logger.load('console:', {
  async build(url) {
    return new ConsoleLoggerAdapter(url.toString())
  },
})
