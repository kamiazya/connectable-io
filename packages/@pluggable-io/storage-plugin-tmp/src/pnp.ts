import { Storage } from '@pluggable-io/storage'

import { TmpStoragePlugin } from './plugins/TmpStoragePlugin.js'
import { DEFAULT_SCHEMA } from './constant.js'

declare module '@pluggable-io/storage' {
  type URLString = `${typeof DEFAULT_SCHEMA}//${string}`

  export interface StorageStatic {
    from(url: URLString): Promise<Storage>
  }
}

Storage.load(DEFAULT_SCHEMA, new TmpStoragePlugin())
