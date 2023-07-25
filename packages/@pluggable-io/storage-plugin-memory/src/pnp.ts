import { Storage } from '@pluggable-io/storage'
import { MemoryStoragePlugin } from './plugins/MemoryStoragePlugin.js'

declare module '@pluggable-io/storage' {
  type URLString = `memory:`

  export interface StorageStatic {
    /**
     * Build a storage in memory from a URL
     *
     * @example
     *
     * ```ts
     * import { Storage } from '@pluggable-io/storage';
     * import '@pluggable-io/storage-plugin-memory';
     *
     * const storage = await Storage.from('memory://.');
     * ```
     */
    from(url: URLString): Promise<Storage>
  }
}

Storage.registerPlugin('memory:', new MemoryStoragePlugin())
