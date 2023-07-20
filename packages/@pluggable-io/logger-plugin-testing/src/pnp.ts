import { Logger } from '@pluggable-io/logger'
import { NullLoggerAdapter } from './adapters/NullLogger.js'
import { MemoryLoggerAdapter } from './adapters/MemoryLoggerAdapter.js'

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

Logger.registerPlugin('console:', {
  async build(url) {
    return new NullLoggerAdapter(url.toString())
  },
})

Logger.registerPlugin('memory:', {
  async build(url) {
    return new MemoryLoggerAdapter(url.toString())
  },
})
