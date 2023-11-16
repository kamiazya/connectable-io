/// <reference lib="esnext" />
import { tmpdir } from 'node:os'
import { isAbsolute, resolve } from 'node:path'

import { FileSystemStorageAdapter, type FileSystemStorageAdapterOptions } from '@connectable-io/storage-plugin-file'

import { DEFAULT_SCHEMA } from '../constant.js'

/**
 * Options for TmpStorageAdapter
 */
export interface TmpStorageAdapterOptions extends FileSystemStorageAdapterOptions {
  /**
   * The schema to use for the url.
   * This is used to create the url for the storage.
   * The schema is used as the protocol part of the url.
   * @example
   * ```ts
   * const storage = new TmpStorageAdapter({ urlSchema: 'tmp:', baseDir: 'foo' })
   * console.log(storage.url.toString()) // 'tmp://foo'
   * ```
   * @default `tmp:`
   */
  urlSchema?: string

  /**
   * The base directory to use for the storage.
   * Absolute paths are used as is.
   * Paths given as relative paths are resolved starting from `os.tmpdir()`.
   * @default `os.tmpdir()`
   */
  baseDir?: string
}

/**
 * A Storage implementation for the tmp directory
 */
export class TmpStorageAdapter extends FileSystemStorageAdapter {
  public get url(): URL {
    return new URL(this.baseDir, `${this.urlSchema}//`)
  }
  constructor({ urlSchema = DEFAULT_SCHEMA, baseDir = tmpdir(), ...options }: TmpStorageAdapterOptions = {}) {
    super({ urlSchema, baseDir: isAbsolute(baseDir) ? baseDir : resolve(tmpdir(), baseDir), ...options })
  }
}
