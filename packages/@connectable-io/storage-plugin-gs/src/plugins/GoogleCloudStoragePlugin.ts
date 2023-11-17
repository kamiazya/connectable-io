import { ResourcePlugin } from '@connectable-io/core'
import { GoogleCloudStorageAdapter } from '../adapters/GoogleCloudStorageAdapter.js'

export class GoogleCloudStoragePlugin implements ResourcePlugin<GoogleCloudStorageAdapter> {
  async build(url: string) {
    const url_ = new URL(url)
    return new GoogleCloudStorageAdapter({
      urlSchema: url_.protocol,
      bucket: url_.host,
      prefix: url_.pathname === '' ? '' : url_.pathname.slice(1),
    })
  }
}
