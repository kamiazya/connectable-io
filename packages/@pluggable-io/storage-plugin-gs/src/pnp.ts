import { Storage } from '@pluggable-io/storage'

import { GoogleCloudStoragePlugin } from './plugins/GoogleCloudStoragePlugin.js'

type URLString = `gs://${string}`

declare module '@pluggable-io/storage' {
  export interface StorageStatic {
    from(url: URLString): Promise<Storage>
  }
}

Storage.registerPlugin('gs:', new GoogleCloudStoragePlugin())
