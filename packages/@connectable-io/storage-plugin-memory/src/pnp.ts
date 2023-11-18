import { Storage } from '@connectable-io/storage'
import { MemoryStoragePlugin } from './plugins/MemoryStoragePlugin.js'

declare module '@connectable-io/storage' {
  type URLString = `memory:`

  export interface StorageStatic {
    /**
     * Build a storage in memory from a URL
     *
     * @example
     *
     * ```ts
     * import { Storage } from '@connectable-io/storage';
     * import '@connectable-io/storage-plugin-memory';
     *
     * const storage = await Storage.from('memory://.');
     * ```
     */
    from(url: URLString): Promise<Storage>
  }
}

Storage.load('memory:', new MemoryStoragePlugin())
