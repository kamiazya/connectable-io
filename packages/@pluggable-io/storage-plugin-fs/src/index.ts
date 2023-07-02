import Storage from '@pluggable-io/storage'

import { FileSystemPlugin } from './plugin.js'

declare module '@pluggable-io/storage' {
  type URLString = `fs://${string}`

  export interface StorageStatic {
    /**
     * Build a storage based on local FileSystem from a URL
     *
     * @example use current directory as storage
     *
     * ```ts
     * import { Storage } from '@pluggable-io/storage';
     * import '@pluggable-io/storage-plugin-fs';
     *
     * const storage = await Storage.from('fs://.');
     * ```
     *
     * @example use a directory as storage
     *
     * ```ts
     * import { Storage } from '@pluggable-io/storage';
     * import '@pluggable-io/storage-plugin-fs';
     *
     * const storage = await Storage.from('fs://./path/to/storage');
     * ```
     *
     *  @example use absolute path as storage
     *
     * ```ts
     * import { Storage } from '@pluggable-io/storage';
     * import '@pluggable-io/storage-plugin-fs';
     *
     * const storage = await Storage.from('fs:///path/to/storage');
     * ```
     */
    from(url: URLString): Promise<Storage>
  }
}

Storage.registerPlugin('fs:', new FileSystemPlugin())
