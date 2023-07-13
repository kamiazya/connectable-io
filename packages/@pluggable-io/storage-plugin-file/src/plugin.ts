import { isAbsolute, join } from 'node:path'
import { mkdir } from 'node:fs/promises'

import { ResourcePlugin } from '@pluggable-io/core'

import { FileSystemStorageAdapter } from './fs.js'

export interface FileSystemStoragePluginOptions {
  /**
   * The base directory to use for the storage.
   *
   * Absolute paths are used as is.
   * Paths given as relative paths are resolved starting from `process.pwd()`.
   * @default `process.cwd()`
   */
  baseDir?: string

  /**
   * If true, the base directory will be created if it does not exist.
   *
   * @default `false`
   */
  createIfNotExists?: boolean
}

/**
 * A plugin for building a FileSyetem Storage from a URL
 */
export class FileSystemStoragePlugin implements ResourcePlugin<FileSystemStorageAdapter> {
  public readonly baseDir: string
  public readonly createIfNotExists: boolean
  constructor({ baseDir = process.cwd(), createIfNotExists = false }: FileSystemStoragePluginOptions = {}) {
    if (isAbsolute(baseDir)) {
      this.baseDir = baseDir
    } else {
      this.baseDir = join(process.cwd(), baseDir)
    }

    this.createIfNotExists = createIfNotExists
  }

  async build(url: URL) {
    let path = url.host === '' ? url.pathname : join(this.baseDir, url.host, url.pathname)
    if (!isAbsolute(path)) {
      path = join(this.baseDir, path)
    }
    const storage = new FileSystemStorageAdapter({
      urlSchema: url.protocol,
      baseDir: path,
    })
    if (this.createIfNotExists) {
      const exists = await storage.exists(path)
      if (!exists) {
        await mkdir(path, { recursive: true })
      }
    }
    return storage
  }
}
