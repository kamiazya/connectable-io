/**
 * FileNotExixtsError is an error thrown when a file does not exists.
 * @example
 * ```ts
 * const storage = await Storage.from('file://.');
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

/**
 * PermissionDeniedError is an error thrown when
 *
 * @example Out of under storage.
 *
 * ```ts
 * const storage = await Storage.from('file://.');
 * try {
 *  const file = await storage.get('../package.json');
 * } catch (e) {
 *  if (e instanceof PermissionDeniedError) {
 *    console.log('Permission denied.');
 * }
 */
export class PermissionDeniedError extends Error {
  static {
    this.prototype.name = 'PermissionDeniedError'
  }
}
