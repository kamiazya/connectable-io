import { isAbsolute, join } from 'node:path'
import { mkdir } from 'node:fs/promises'

import { ResourcePlugin } from '@pluggable-io/core'

import { FileSystemStorageAdapter, FileSystemStorageAdapterOptions } from '../adapters/FileSystemStorageAdapter.js'

/**
 * Options for FileSystemStoragePlugin
 */
export interface FileSystemStoragePluginOptions extends Omit<FileSystemStorageAdapterOptions, 'urlSchema'> {}

/**
 * A plugin for building a FileSystem Storage from a URL
 */
export class FileSystemStoragePlugin implements ResourcePlugin<FileSystemStorageAdapter> {
  public readonly baseDir: string
  public readonly options: {
    read?: boolean
    write?: boolean
    create?: boolean
    mode?: number
  }
  public readonly createDirectoryIfNotExists: boolean

  constructor({
    baseDir = process.cwd(),
    createDirectoryIfNotExists = true,
    ...options
  }: FileSystemStoragePluginOptions = {}) {
    this.baseDir = isAbsolute(baseDir) ? baseDir : join(process.cwd(), baseDir)
    this.options = options

    this.createDirectoryIfNotExists = createDirectoryIfNotExists
  }

  async build(url: string) {
    const url_ = new URL(url)
    let path = url_.host === '' ? url_.pathname : join(this.baseDir, url_.host, url_.pathname)
    if (!isAbsolute(path)) {
      path = join(this.baseDir, path)
    }
    const storage = new FileSystemStorageAdapter({
      urlSchema: url_.protocol,
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
