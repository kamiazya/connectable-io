import { ReadableStream, WritableStream } from '@pluggable-io/common'
import { Registory, RegistoryBase } from '@pluggable-io/core'

/**
 * FileHundleOpenOptions is a options for {@link Storage#open} method
 * and {@link Storage.open} static method.
 */
export interface FileHundleOpenOptions {
  /**
   * Sets the option for read access.
   *
   * This option, when `true`, means that the file should be read-able if opened.
   *
   * @default true
   */
  read?: boolean
  /**
   * Sets the option for write access.
   *
   * This option, when true, means that the file should be write-able if opened.
   * If the file already exists, any write calls on it will overwrite its contents,
   * by default without truncating it.
   *
   * @default false
   */
  write?: boolean
  /**
   * Sets the option to allow creating a new file,
   * if one doesn't already exist at the specified path.
   *
   * Requires {@link write} access to be used.
   *
   * @default false
   */
  create?: boolean
}

/**
 * Storage is a pluggable interface for file system.
 */
export interface Storage {
  /**
   * Check if a file exists.
   *
   * @throws {PermissionDeniedError} given key is outside of the storage.
   * @throws {OperationFailedError} if the operation is failed.
   */
  exists(key: string): Promise<boolean>
  /**
   * Delete a file.
   *
   * @throws {PermissionDeniedError} given key is outside of the storage.
   * @throws {FileNotExistsError} if the file does not exists.
   * @throws {OperationFailedError} if the operation is failed.
   *
   * @param key key of the file.
   * @example
   * ```ts
   * const storage = await Storage.from('example://.');
   * await storage.delete('package.json');
   * ```
   */
  delete(key: string): Promise<void>
  /**
   * Get a file.
   * @param key
   * @throws {PermissionDeniedError} given key is outside of the storage.
   * @throws {FileNotExistsError} if the file does not exists.
   * @throws {OperationFailedError} if the operation is failed.
   * @example
   * ```ts
   * const storage = await Storage.from('example://.');
   * const file = await storage.open('package.json');
   * ```
   */
  open(key: string, options?: FileHundleOpenOptions): Promise<FileHandle>

  /**
   * List files under the prefix.
   *
   * If prefix is not given, list all files in the storage root.
   * If result object type is a directory(like), the path ends with `/`.
   *
   * @param prefix prefix of the file, allow to glob pattern.
   * @returns list of files. relative path from the storage root.
   * @throws {PermissionDeniedError} given key is outside of the storage.
   * Or if directory is not readable.
   * @throws {OperationFailedError} if the operation is failed.
   *
   * @example List all files.
   * ```ts
   * const storage = await Storage.from('example://.');
   * const files = await storage.list();
   * console.log(files);
   * ```
   * @example List json files.
   * ```ts
   * const storage = await Storage.from('example://.');
   * const files = await storage.list('*.json');
   * console.log(files);
   * ```
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
   * const storage = await Storage.from('file://.');
   * const file = await storage.open('package.json');
   * console.log(file.uri);
   * // => file:///absolute/path/to/package.json
   * ```
   */
  uri: string
  /**
   * Create a readable stream.
   *
   * @throws {PermissionDeniedError} if file is not readable.
   * A restricted security model at the software level for Storage
   * and a security model at the infrastructure layer will be identified.
   * @throws {FileNotExistsError} if the file does not exists.
   * @throws {OperationFailedError} if the operation is failed.
   */
  createReadStream(): Promise<ReadableStream>
  /**
   * Create a writable stream.
   *
   * @throws {PermissionDeniedError} if file is not writable.
   * A restricted security model at the software level for Storage
   * and a security model at the infrastructure layer will be identified.
   * @throws {FileNotExistsError} if the file does not exists.
   * @throws {OperationFailedError} if the operation is failed.
   */
  createWriteStream(): Promise<WritableStream>
}

/**
 * StorageStatic is a pluggable interface for Storage.
 * @example
 * ```ts
 * import '@pluggable-io/storage-plugin-file';
 * import Storage from '@pluggable-io/storage';
 *
 * const storage = await Storage.from('file://.');
 *
 * const files = await storage.list()
 * console.log(files);
 * ```
 */
export interface StorageStatic extends Registory<Storage> {
  /**
   * Open a file.
   * @param url URI of the file.
   * @throws {import('@pluggable-io/core').PluginNotLoadedError} if the scheme is not loaded.
   * @example
   * ```ts
   * const file = await Storage.open('file://./package.json');
   * ```
   * @beta This method is experimental.
   */
  open(url: string, options?: FileHundleOpenOptions): Promise<FileHandle>
}

export class StorageRegistory extends RegistoryBase<Storage> implements StorageStatic {
  constructor() {
    super('Storage')
  }
  /**
   * Open a file.
   *
   * @param uri URI of the file.
   * @throws {import('@pluggable-io/core').PluginNotLoadedError} if the scheme is not loaded.
   * @throws {PermissionDeniedError} given key is outside of the storage.
   * @throws {FileNotExistsError} if the file does not exists.
   * @beta This method is experimental.
   */
  async open(uri: string, options?: FileHundleOpenOptions): Promise<FileHandle> {
    const path = new URL(uri)
    const storageURL = new URL('/', path)
    const storage = await this.from(storageURL.toString())
    return storage.open(path.pathname, options)
  }
}

export const Storage: StorageStatic = new StorageRegistory()
