import { Logger } from '@pluggable-io/logger'
import { MemoryLoggerAdapter } from './adapters/MemoryLoggerAdapter.js'

type URLString = 'memory:'

declare module '@pluggable-io/logger' {
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

Logger.registerPlugin('memory:', {
  async build(url) {
    return new MemoryLoggerAdapter(url.toString())
  },
})
