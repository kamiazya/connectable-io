import { ReadableStream, WritableStream } from '@pluggable-io/common'
import { Registory, RegistoryBase } from '@pluggable-io/core'

/**
 * Storage is a pluggable interface for file system.
 */
export interface Storage {
  /**
   * Check if a file exists.
   */
  exists(key: string): Promise<boolean>
  /**
   * Delete a file.
   * @throws {FileNotExixtsError} if the file does not exists.
   */
  delete(key: string): Promise<void>
  /**
   * Get a file.
   * @param key
   * @throws {FileNotExixtsError} if the file does not exists.
   * @example
   * ```ts
   * const storage = await Storage.from('example://.');
   * const file = await storage.open('package.json');
   * ```
   */
  open(key: string): Promise<FileHandle>

  /**
   * List files.
   *
   * @param prefix
   */
  list(prefix?: string): Promise<string[]>
}

/**
 * Resource is a pluggable interface for file.
 */
export interface FileHandle {
  /**
   * URI of the file.
   * @example
   * ```ts
   * const storage = await Storage.from('fs://.');
   * const file = await storage.get('package.json');
   * console.log(file.uri.toString());
   * ```
   */
  uri: URL
  /**
   * Create a readable stream.
   */
  createReadStream(): Promise<ReadableStream>
  /**
   * Create a writable stream.
   */
  createWriteStream(): Promise<WritableStream>
}

/**
 * StorageStatic is a pluggable interface for Storage.
 * @example
 * ```ts
 * import '@pluggable-io/storage-plugin-fs';
 * import Storage from '@pluggable-io/storage';
 *
 * const storage = await Storage.from('fs://.');
 *
 * const files = await storage.list()
 * console.log(files);
 * ```
 */
export interface StorageStatic extends Registory<Storage> {
  /**
   * Open a file.
   * @param url URI of the file.
   * @throws {PluginNotInstalledError} if the scheme is not loaded.
   * @example
   * ```ts
   * const file = await Storage.open('fs://./package.json');
   * ```
   * @beta This method is experimental.
   */
  open(url: string): Promise<FileHandle>
}

export class StorageRegistory extends RegistoryBase<Storage> implements StorageStatic {
  /**
   * Open a file.
   * @beta This method is experimental.
   */
  async open(url: string): Promise<FileHandle> {
    const path = new URL(url)
    const storageURL = new URL('/', path)
    const storage = await this.from(storageURL.toString())
    return storage.open(path.pathname)
  }
}

export const Storage: StorageStatic = new StorageRegistory()
