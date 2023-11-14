import { ResourcePlugin } from '@connectable-io/core'
import { GoogleCloudStorageAdapter } from '../adapters/GoogleCloudStorageAdapter.js'

export class GoogleCloudStoragePlugin implements ResourcePlugin<GoogleCloudStorageAdapter> {
  async build(url: URL) {
    return new GoogleCloudStorageAdapter({
      urlSchema: url.protocol,
      bucket: url.host,
      prefix: url.pathname === '' ? '' : url.pathname.slice(1),
    })
  }
}
