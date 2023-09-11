import { Readable, Writable } from 'node:stream'
import { open, lstat, readdir, rm, access, constants } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'

import {
  FileNotExixtsError,
  FileHandle,
  Storage,
  PermissionDeniedError,
  FileHundleOpenOptions,
} from '@pluggable-io/storage'
import { DEFAULT_SCHEMA } from '../constant.js'

interface FileSystemStorageAdapterOptions extends FileHundleOpenOptions {
  /**
   * The schema to use for the url.
   * This is used to create the url for the storage.
   * The schema is used as the protocol part of the url.
   * @example
   * ```ts
   * const storage = new FileSystemStorageAdapter({ urlSchema: 'fs', baseDir: 'foo' })
   * console.log(storage.url.toString()) // 'fs://foo'
   * ```
   * @default `file:`
   */
  urlSchema?: string
  /**
   * The base directory to use for the storage.
   * Absolute paths are used as is.
   * Paths given as relative paths are resolved starting from `process.pwd()`.
   * @default `process.cwd()`
   */
  baseDir?: string

  /**
   * The mode to use when opening files.
   *
   * @default `0o666` readable and writable by everyone
   */
  mode?: number
}

/**
 * A Storage implementation for the file system
 */
export class FileSystemStorageAdapter implements Storage {
  private readonly urlSchema: string

  private readonly baseDir: string

  private readonly read: boolean
  private readonly write: boolean
  private readonly create: boolean
  private readonly mode: number

  public get url(): URL {
    return new URL(this.baseDir, `${this.urlSchema}/`)
  }
  constructor({
    urlSchema = DEFAULT_SCHEMA,
    baseDir = process.cwd(),
    read = true,
    write = true,
    create = true,
    mode = 0o666,
  }: FileSystemStorageAdapterOptions = {}) {
    this.urlSchema = urlSchema
    this.baseDir = isAbsolute(baseDir) ? baseDir : resolve(process.cwd(), baseDir)
    this.read = read
    this.write = write
    this.create = create
    this.mode = mode
  }

  _resolvePath(...filePath: (string | undefined)[]) {
    return resolve(this.baseDir, ...filePath.filter<string>((v): v is string => typeof v === 'string'))
  }

  async _exists(filePath: string): Promise<boolean> {
    try {
      return !!(await lstat(filePath))
    } catch (e) {
      return false
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const resolvedPath = this._resolvePath(filePath)
    if (relative(this.baseDir, resolvedPath).startsWith('..'))
      throw new PermissionDeniedError(`Path is out of base directory. url:${filePath}`)
    return this._exists(resolvedPath)
  }

  async delete(filePath: string): Promise<void> {
    const resolvedPath = this._resolvePath(filePath)
    if (relative(this.baseDir, resolvedPath).startsWith('..'))
      throw new PermissionDeniedError(`Path is out of base directory. url:${filePath}`)

    const exists = await this._exists(resolvedPath)
    if (exists === false) throw new FileNotExixtsError(`File dose not exists. url:${filePath}`)
    await rm(this._resolvePath(filePath))
  }
  async open(
    key: string,
    { read = this.read, write = this.write, create = this.create }: FileHundleOpenOptions = {},
  ): Promise<FileHandle> {
    const resolved = this._resolvePath(key)
    if (relative(this.baseDir, resolved).startsWith('..'))
      throw new PermissionDeniedError(`Path is out of base directory. url:${key}`)

    return {
      uri: Object.freeze(new URL(key, `${this.url}/`)),
      createReadStream: async () => {
        if (read === false) throw new PermissionDeniedError(`Read permission denied. url:${key}`)
        const exists = await this._exists(resolved)
        if (exists) {
          try {
            await access(resolved, constants.R_OK)
          } catch (e) {
            throw new PermissionDeniedError(`Read permission denied. url:${key}`) // , { cause: e }
          }
        } else {
          throw new FileNotExixtsError(`File dose not exists. url:${key}`)
        }

        const file = await open(resolved, 'r')
        return Readable.toWeb(file.createReadStream())
      },
      createWriteStream: async () => {
        if (write === false) throw new PermissionDeniedError(`Write permission denied. url:${key}`)
        const exists = await this._exists(resolved)
        if (exists) {
          try {
            await access(resolved, constants.W_OK)
          } catch (e) {
            throw new PermissionDeniedError(`Write permission denied. url:${key}`) // , { cause: e }
          }
        } else {
          if (create === false) throw new FileNotExixtsError(`File dose not exists. url:${key}`)
        }

        const file = await open(resolved, 'w', create ? this.mode : undefined)
        return Writable.toWeb(file.createWriteStream())
      },
    }
  }
  async list(prefix?: string) {
    return readdir(this._resolvePath(prefix))
  }
}
