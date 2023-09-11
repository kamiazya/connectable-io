/**
 * Error thrown when the corresponding plugin for the schema is not loaded.
 */
export class PluginNotLoadedError extends Error {
  static {
    this.prototype.name = 'PluginNotLoadedError'
  }
}

/**
 * Error thrown when a plugin corresponding to the schema has already been loaded.
 */
export class PluginAlreadyLoadedError extends Error {
  static {
    this.prototype.name = 'PluginAlreadyLoadedError'
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
   * @beta This is experimental.
   */
  PLUGIN_PLUG_AND_PLAY: Record<string, () => Promise<any>>

  /**
   * Load a plugin
   * @param protocol The protocol to load for
   * @param plugin The plugin to load
   * @throws {PluginAlreadyLoadedError} If a plugin is already loaded for the scheme
   * @example
   * ```ts
   * const registory = new Registory();
   *
   * registory.load('sample:', {
   *    async build(url) {
   *     return new SampleStorage(url);
   *   }
   * })
   * ```
   */
  load(protocol: string, plugin: ResourcePlugin<T>): void
  /**
   * Build an instance from a URL
   * @param url The URL to build from
   * @returns The built instance
   * @throws {PluginNotLoadedError} If no plugin is loaded for the protocol
   * @throws {TypeError} If url is not a valid URL
   */
  from(url: string): Promise<T>
}
