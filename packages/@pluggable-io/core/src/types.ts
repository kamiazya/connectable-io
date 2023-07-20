/**
 * Error thrown when a plugin is not registerd.
 */
export class PluginNotRegisteredError extends Error {
  static {
    this.prototype.name = 'PluginNotRegisteredError'
  }
}

/**
 * Error thrown when a plugin is already registered.
 */
export class PluginAlreadyRegisteredError extends Error {
  static {
    this.prototype.name = 'PluginAlreadyRegisteredError'
  }
}

/**
 * A plugin for building a resource from a URL
 */
export interface ResourcePlugin<T = any> {
  /**
   * Build an instance from a URL
   *
   * @param url The URL to build from
   */
  build(url: URL): Promise<T>
}

/**
 * A registry for resources.
 */
export interface Registory<T> {
  /**
   * Register a plugin
   * @param protocol The protocol to register for
   * @param plugin The plugin to register
   * @throws {PluginAlreadyRegisteredError} If a plugin is already registered for the scheme
   * @example
   * ```ts
   * const registory = new Registory();
   *
   * registory.registerPlugin('sample:', {
   *    async build(url) {
   *     return new SampleStorage(url);
   *   }
   * })
   * ```
   */
  registerPlugin(protocol: string, plugin: ResourcePlugin<T>): void
  /**
   * Build an instance from a URL
   * @param url The URL to build from
   * @returns The built instance
   * @throws {PluginNotRegisteredError} If no plugin is registered for the protocol
   * @throws {TypeError} If url is not a valid URL
   */
  from(url: string): Promise<T>
}
