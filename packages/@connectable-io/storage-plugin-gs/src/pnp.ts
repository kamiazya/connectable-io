import { Storage } from '@connectable-io/storage'

import { GoogleCloudStoragePlugin } from './plugins/GoogleCloudStoragePlugin.js'

type URLString = `gs://${string}`

declare module '@connectable-io/storage' {
  export interface StorageStatic {
    from(url: URLString): Promise<Storage>
  }
}

Storage.load('gs', new GoogleCloudStoragePlugin())
