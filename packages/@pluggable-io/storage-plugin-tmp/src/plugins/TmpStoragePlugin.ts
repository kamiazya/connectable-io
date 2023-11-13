import { webcrypto } from 'node:crypto'
import { tmpdir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { mkdir } from 'node:fs/promises'

import { ResourcePlugin } from '@pluggable-io/core'
import { FileSystemStoragePlugin } from '@pluggable-io/storage-plugin-file'

import { TmpStorageAdapter, TmpStorageAdapterOptions } from '../adapters/TmpStorageAdapter.js'

/**
 * Options for TmpStoragePlugin
 */
export interface TmpStoragePluginOptions extends Omit<TmpStorageAdapterOptions, 'urlSchema'> {}

/**
 * A plugin for building a Tmp Storage from a URL
 */
export class TmpStoragePlugin extends FileSystemStoragePlugin implements ResourcePlugin<TmpStorageAdapter> {
  constructor({ baseDir = tmpdir(), ...options }: TmpStoragePluginOptions = {}) {
    super({ baseDir: isAbsolute(baseDir) ? baseDir : join(tmpdir(), baseDir), ...options })
  }

  async build(url: URL) {
    const pathname = url.pathname || webcrypto.randomUUID()

    let path = url.host === '' ? pathname : join(this.baseDir, url.host, pathname)
    if (!isAbsolute(path)) {
      path = join(this.baseDir, path)
    }
    const storage = new TmpStorageAdapter({
      urlSchema: url.protocol,
      baseDir: path,
      ...this.options,
    })
    if (this.createDirectoryIfNotExists) {
      const exists = await storage.exists(path)
      if (!exists) {
        await mkdir(path, { recursive: true })
      }
    }
    return storage
  }
}
