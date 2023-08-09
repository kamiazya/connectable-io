import { isAbsolute, join } from 'node:path'
import { ResourcePlugin } from '@pluggable-io/core'
import { GoogleCloudStorageAdapter } from '../adapters/GoogleCloudStorageAdapter.js'

export interface GoogleCloudStoragePluginOptions {
  baseDir?: string
  createIfNotExists?: boolean
}

export class GoogleCloudStoragePlugin implements ResourcePlugin<GoogleCloudStorageAdapter> {
  public readonly baseDir: string
  public readonly createIfNotExists: boolean
  constructor({ baseDir = process.cwd(), createIfNotExists = false }: GoogleCloudStoragePluginOptions = {}) {
    if (isAbsolute(baseDir)) {
      this.baseDir = baseDir
    } else {
      this.baseDir = join(process.cwd(), baseDir)
    }

    this.createIfNotExists = createIfNotExists
  }

  async build(url: URL) {
    return new GoogleCloudStorageAdapter({
      urlSchema: url.protocol,
      bucket: url.host,
      prefix: url.pathname === '' ? '' : url.pathname.slice(1),
    })
  }
}
