/// <reference lib="esnext" />
import { Readable, Writable } from 'node:stream'
import { open, lstat, rm, access, constants, mkdir } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import { glob } from 'glob'

import {
  FileNotExistsError,
  FileHandle,
  Storage,
  PermissionDeniedError,
  FileHundleOpenOptions,
  OperationFailedError,
} from '@pluggable-io/storage'
import { DEFAULT_SCHEMA } from '../constant.js'

/**
 * Options for FileSystemStorageAdapter
 */
export interface FileSystemStorageAdapterOptions extends FileHundleOpenOptions {
  /**
   * The schema to use for the url.
   * This is used to create the url for the storage.
   * The schema is used as the protocol part of the url.
   * @example
   * ```ts
   * const storage = new FileSystemStorageAdapter({ urlSchema: 'file', baseDir: 'foo' })
   * console.log(storage.url.toString()) // 'file://foo'
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

  /**
   * Whether to allow creating directories automatically.
   * If set to `false`, an error will be thrown if the directory does not exist.
   *
   * @default `true`
   */
  createDirectoryIfNotExists?: boolean
}

/**
 * A Storage implementation for the file system
 */
export class FileSystemStorageAdapter implements Storage {
  public readonly urlSchema: string

  public readonly baseDir: string

  public readonly read: boolean
  public readonly write: boolean
  public readonly create: boolean
  public readonly mode: number
  public readonly createDirectoryIfNotExists: boolean

  public get url(): URL {
    return new URL(this.baseDir, `${this.urlSchema}/`)
  }
  constructor({
    urlSchema = DEFAULT_SCHEMA,
    baseDir = process.cwd(),
    read = true,
    write = false,
    create = false,
    createDirectoryIfNotExists = true,
    mode = 0o666,
  }: FileSystemStorageAdapterOptions = {}) {
    this.urlSchema = urlSchema
    this.baseDir = isAbsolute(baseDir) ? baseDir : resolve(process.cwd(), baseDir)
    this.read = read
    this.write = write
    this.create = create
    this.mode = mode
    this.createDirectoryIfNotExists = createDirectoryIfNotExists
  }

  _resolvePath(...filePath: (string | undefined)[]) {
    return resolve(this.baseDir, ...filePath.filter<string>((v): v is string => typeof v === 'string'))
  }

  /**
   * Check if a file exists. This method is used internally.
   *
   * @private
   * @param {string} filePath absolute path to the file
   * @returns File exists or not
   */
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
    if (exists === false) throw new FileNotExistsError(`File dose not exists. url:${filePath}`)
    try {
      await rm(this._resolvePath(filePath))
    } catch (e) {
      throw new OperationFailedError(`Failed to delete file. url:${filePath}`, { cause: e })
    }
  }

  async open(
    key: string,
    { read = this.read, write = this.write, create = this.create }: FileHundleOpenOptions = {},
  ): Promise<FileHandle> {
    const resolved = this._resolvePath(key)
    if (relative(this.baseDir, resolved).startsWith('..'))
      throw new PermissionDeniedError(`Path is out of base directory. url:${key}`)

    return {
      uri: new URL(key, `${this.url}/`).toString(),
      createReadStream: async () => {
        // Check storage level read permission
        if (read === false) throw new PermissionDeniedError(`Read permission denied. url:${key}`)

        // Check file exists
        const exists = await this._exists(resolved)
        if (exists) {
          // Check file level read permission
          try {
            await access(resolved, constants.R_OK)
          } catch (e) {
            throw new PermissionDeniedError(`Read permission denied. url:${key}`, { cause: e })
          }
        } else {
          throw new FileNotExistsError(`File dose not exists. url:${key}`)
        }

        try {
          // Open file and return stream
          const file = await open(resolved, 'r')
          return Readable.toWeb(file.createReadStream())
        } catch (e) {
          throw new OperationFailedError(`Failed to open file. url:${key}`, { cause: e })
        }
      },
      createWriteStream: async () => {
        // Check storage level write permission
        if (write === false) throw new PermissionDeniedError(`Write permission denied. url:${key}`)

        // Check directory exists, if not create it if createDirectoryIfNotExists is true
        if (this.createDirectoryIfNotExists) {
          const directoryPath = this._resolvePath(key, '..')
          const directoryExists = await this._exists(directoryPath)
          if (!directoryExists) {
            try {
              await mkdir(directoryPath, { recursive: true })
            } catch (e) {
              throw new OperationFailedError(`Failed to create directory. url:${key}`, { cause: e })
            }
          }
        }

        // Check file exists
        const exists = await this._exists(resolved)
        if (exists) {
          // Check file level write permission
          try {
            await access(resolved, constants.W_OK)
          } catch (e) {
            throw new PermissionDeniedError(`Write permission denied. url:${key}`, { cause: e })
          }
        } else {
          // Check storage level create permission
          if (create === false) {
            throw new FileNotExistsError(`File dose not exists. url:${key}`)
          }
        }

        try {
          // Open file and return stream
          const file = await open(resolved, 'w', create ? this.mode : undefined)
          return Writable.toWeb(file.createWriteStream())
        } catch (e) {
          throw new OperationFailedError(`Failed to open file. url:${key}`, { cause: e })
        }
      },
    }
  }

  async list(prefix?: string) {
    const resolved = this._resolvePath(prefix)
    if (relative(this.baseDir, resolved).startsWith('..'))
      throw new PermissionDeniedError(`Path is out of base directory. url:${prefix}`)

    try {
      await access(this._resolvePath(prefix), constants.R_OK)
    } catch (e) {
      throw new PermissionDeniedError(`Read permission denied. url:${prefix}`, { cause: e })
    }

    try {
      const results = await glob(prefix ?? '*', {
        cwd: this.baseDir,
        withFileTypes: true,
      })
      return results.map((result) =>
        result.isDirectory()
          ? `${relative(this.baseDir, result.fullpath())}/`
          : relative(this.baseDir, result.fullpath()),
      )
    } catch (e) {
      throw new OperationFailedError(`Failed to read directory. url:${prefix}`, { cause: e })
    }
  }
}
