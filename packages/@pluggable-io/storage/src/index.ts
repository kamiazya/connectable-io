import { ReadableStream, WritableStream } from 'node:stream/web';
import { Registory, RegistoryCore } from '@pluggable-io/core';

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

export interface StorageStatic extends Registory<Storage> {}
export const Storage: StorageStatic = new class extends RegistoryCore<Storage>{} ();

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
 * FileNotExixtsError is an error thrown when a file does not exists.
 * @example
 * ```ts
 * const storage = await Storage.from('fs://.');
 * try {
 *   const file = await storage.get('package.json');
 * } catch (e) {
 *   if (e instanceof FileNotExixtsError) {
 *    console.log('File dose not exists.');
 *   }
 * }
 * ```
 */
export class FileNotExixtsError extends Error {
  static {
    this.prototype.name = 'FileNotExixtsError'
  }
}

export default Storage;
