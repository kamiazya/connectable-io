import { Registory, RegistoryBase } from "@pluggable-io/core"
import { ReadableStream, WritableStream } from "node:stream/web"

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
   * const storage = await Storage.from('fs://.');
   * const file = await storage.get('package.json');
   * ```
   */
  get(key: string): Promise<Resource>

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
export interface Resource {
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
export interface StorageStatic extends Registory<Storage> {}
export const Storage: StorageStatic = new class extends RegistoryBase<Storage>{} ();
