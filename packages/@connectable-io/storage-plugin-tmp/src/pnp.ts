import { Storage } from '@connectable-io/storage'

import { TmpStoragePlugin } from './plugins/TmpStoragePlugin.js'
import { DEFAULT_SCHEMA } from './constant.js'

type URLString = `${typeof DEFAULT_SCHEMA}//${string}`

declare module '@connectable-io/storage' {
  export interface StorageStatic {
    /**
     * Build a storage based on local Tmp directory from a URL
     *
     * @example use current directory as storage
     *
     * ```ts
     * import { Storage } from '@connectable-io/storage';
     * import '@connectable-io/storage-plugin-tmp';
     *
     * const storage = await Storage.from('tmp://.');
     * ```
     *
     * @example use a directory as storage
     *
     * ```ts
     * import { Storage } from '@connectable-io/storage';
     * import '@connectable-io/storage-plugin-tmp';
     *
     * const storage = await Storage.from('tmp://./path/to/storage');
     * ```
     *
     *  @example use absolute path as storage
     *
     * ```ts
     * import { Storage } from '@connectable-io/storage';
     * import '@connectable-io/storage-plugin-tmp';
     *
     * const storage = await Storage.from('tmp:///path/to/storage');
     * ```
     */
    from(url: URLString): Promise<Storage>
  }
}

Storage.load(DEFAULT_SCHEMA, new TmpStoragePlugin())
