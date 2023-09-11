import { Storage } from '@pluggable-io/storage'

import { FileSystemStoragePlugin } from './plugins/FileSystemStoragePlugin.js'
import { DEFAULT_SCHEMA } from './constant.js'

declare module '@pluggable-io/storage' {
  type URLString = `file://${string}`

  export interface StorageStatic {
    /**
     * Build a storage based on local FileSystem from a URL
     *
     * @example use current directory as storage
     *
     * ```ts
     * import { Storage } from '@pluggable-io/storage';
     * import '@pluggable-io/storage-plugin-file';
     *
     * const storage = await Storage.from('file://.');
     * ```
     *
     * @example use a directory as storage
     *
     * ```ts
     * import { Storage } from '@pluggable-io/storage';
     * import '@pluggable-io/storage-plugin-file';
     *
     * const storage = await Storage.from('file://./path/to/storage');
     * ```
     *
     *  @example use absolute path as storage
     *
     * ```ts
     * import { Storage } from '@pluggable-io/storage';
     * import '@pluggable-io/storage-plugin-file';
     *
     * const storage = await Storage.from('file:///path/to/storage');
     * ```
     */
    from(url: URLString): Promise<Storage>
  }
}

Storage.load(DEFAULT_SCHEMA, new FileSystemStoragePlugin())
