import { Readable, Writable } from 'node:stream'
import { open, lstat, readdir, rm } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'

import { FileNotExixtsError, Resource, Storage } from '@pluggable-io/storage'

interface FileSystemStorageAdapterOptions {
  urlSchema: string
  baseDir?: string
}

/**
 * A Storage implementation for the file system
 */
export class FileSystemStorageAdapter implements Storage {
  private readonly urlSchema: string

  /**
   * The base directory to use for the storage.
   * Absolute paths are used as is.
   * Paths given as relative paths are resolved starting from `process.pwd()`.
   * @default `process.cwd()`
   */
  private readonly baseDir: string
  public get url(): URL {
    return new URL(`${this.urlSchema}://${this.baseDir}`)
  }
  constructor(
    { urlSchema, baseDir = process.cwd() }: FileSystemStorageAdapterOptions
  ) {
    this.urlSchema = urlSchema
    this.baseDir = isAbsolute(baseDir) ? baseDir : resolve(process.cwd(), baseDir)
  }

  resolvePath(...filePath: (string | undefined)[]) {
    return resolve(this.baseDir, ...filePath.filter<string>((v): v is string => typeof v === 'string'))
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      return !!(await lstat(this.resolvePath(filePath)))
    } catch (e) {
      return false
    }
  }

  async delete(filePath: string): Promise<void> {
    const exists = await this.exists(filePath)
    if (exists === false) throw new FileNotExixtsError(`File dose not exists. url:${filePath}`)
    await rm(this.resolvePath(filePath))
  }
  async get(key: string): Promise<Resource> {
    return {
      // uri: new URL(key, this.url),
      createReadStream: async () => {
        const exists = await this.exists(key)
        if (exists === false) throw new FileNotExixtsError(`File dose not exists. url:${key}`)
        const file = await open(this.resolvePath(key))
        return Readable.toWeb(file.createReadStream())
      },
      createWriteStream: async () => {
        const file = await open(this.resolvePath(key), 'w')
        return Writable.toWeb(file.createWriteStream())
      },
    }
  }
  async list(prefix?: string) {
    return readdir(this.resolvePath(prefix))
  }
}
