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
 * Error thrown when a plugin fails to build a resource.
 */
export class ResourceBuildError extends Error {
  static {
    this.prototype.name = 'ResourceBuildError'
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
 * A loader for a resource plugin
 */
export interface DynamicPluginLoader {
  (input: URLPatternComponentResult): Promise<void>
}

/**
 * A registry for resources.
 */
export interface Registry<T> {
  /**
   * Add a dynamic plugin loader
   *
   * @example Add a dynamic plugin loader for `sample+{:encoding}:` scheme
   * ```ts
   * const registry = new Registry();
   * registry.addDynamicPluginLoader('sample+{:encoding}:', async ({ groups: { encoding } }) => {
   *   await import(`./plugins/sample/${encoding}.pnp.js`);
   * })
   * ```
   * @param pattern The pattern to load for
   * @param loader The loader to load
   */
  addDynamicPluginLoader(pattern: string, loader: DynamicPluginLoader): void

  /**
   * Load a plugin
   * @param protocol The protocol to load for
   * @param plugin The plugin to load
   * @throws {PluginAlreadyLoadedError} If a plugin is already loaded for the scheme
   * @example
   * ```ts
   * const registry = new Registry();
   *
   * registry.load('sample:', {
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
   * @throws {ResourceBuildError} If the plugin fails to build the instance
   */
  from(url: string): Promise<T>
}
