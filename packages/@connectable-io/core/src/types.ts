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
 * A plugin for building a resource
 */
export interface ResourcePlugin<Resource, Options extends readonly any[] = []> {
  /**
   * Build an instance
   *
   */
  build(key: string, ...options: Options): Promise<Resource>
}

/**
 * A plugin loader for dynamic plugin loading
 *
 * @template Pattern The pattern to load for
 * @template Keys The keys to extract from the pattern
 */
export interface DynamicPluginLoader<Pattern = string, Keys extends string = string> {
  /**
   * The pattern to load for
   * @example
   * ```ts
   * const loader: DynamicPluginLoader = {
   *   pattern: 'sample+{:encoding}://**',
   *   async load(key, { encoding }) {
   *    await import(`./plugins/sample/${encoding}.pnp.js`)
   *   }
   * }
   * ```
   */
  pattern: Pattern
  load(key: string, params: Record<Keys, string>): Promise<void>
}

/**
 * A registry for resources.
 */
export interface Registry<Resource, Options extends readonly any[] = [], Pattern = string> {
  /**
   * Add a dynamic plugin loader
   *
   * @example Add a dynamic plugin loader for `sample+{:encoding}` scheme
   * ```ts
   * const registry = new Registry();
   * registory.addDynamicPluginLoader({
   *   pattern: 'sample+{:encoding}://**',
   *   async load(key, { encoding }) {
   *     await import(`./plugins/sample/${encoding}.pnp.js`)
   *   },
   * })
   * ```
   * @param pattern The pattern to load for
   * @param loader The loader to load
   */
  addDynamicPluginLoader<Keys extends string>(loader: DynamicPluginLoader<Pattern, Keys>): void

  /**
   * Load a plugin
   * @param protocol The protocol to load for
   * @param plugin The plugin to load
   * @throws {PluginAlreadyLoadedError} If a plugin is already loaded for the scheme
   * @example
   * ```ts
   * const registry = new Registry();
   *
   * registry.load('sample', {
   *    async build(url) {
   *     return new SampleStorage(url);
   *   }
   * })
   * ```
   */
  load(protocol: string, plugin: ResourcePlugin<Resource, Options>): void
  /**
   * Build an instance from a URL
   * @param url The URL to build from
   * @returns The built instance
   * @throws {PluginNotLoadedError} If no plugin is loaded for the protocol
   * @throws {TypeError} If url is not a valid URL
   * @throws {ResourceBuildError} If the plugin fails to build the instance
   */
  from(key: string, ...options: Options): Promise<Resource>
}

/**
 * A plugin loader for key-based plugin loading
 *
 * @template Keys The keys to extract from the pattern
 * @example Add a dynamic plugin loader for `sample+{:encoding}` key by using RegExp pattern
 * ```ts
 * const loader: KeyBasedPluginLoader<'encoding'> = {
 *   pattern: /^sample\+(?<encoding>.+)$/,
 *   async load(key, { encoding }) {
 *    await import(`./plugins/sample/${encoding}.pnp.js`)
 *   }
 * }
 * ```
 *
 * @example Add a dynamic plugin loader for `sample+{:encoding}` key by using string pattern
 *
 * ```ts
 * const loader: KeyBasedPluginLoader<'encoding'> = {
 *   pattern: '^sample\\+(?<encoding>.+)$',
 *   async load(key, { encoding }) {
 *     await import(`./plugins/sample/${encoding}.pnp.js`)
 *  }
 * }
 * ```
 */
export interface KeyBasedPluginLoader<Keys extends string = string>
  extends DynamicPluginLoader<string | RegExp, Keys> {}

/**
 * A plugin loader for URL-based plugin loading
 *
 * @template Keys The keys to extract from the URLPatternInit pattern
 * @example
 *
 * ```ts
 * const loader: URLBasedPluginLoader<'encoding'> = {
 *   pattern: {
 *     protocol: 'sample+{:encoding}',
 *   },
 *   async load(key, { encoding }) {
 *     await import(`./plugins/sample/${encoding}.pnp.js`)
 *   }
 * }
 * ```
 *
 * @example Add a dynamic plugin loader for `sample+{:encoding}` scheme by using string pattern
 *
 * ```ts
 * const loader: URLBasedPluginLoader<'encoding'> = {
 *   pattern: 'sample+{:encoding}://**',
 *   async load(key, { encoding }) {
 *     await import(`./plugins/sample/${encoding}.pnp.js`)
 *   }
 * }
 */
export interface URLBasedPluginLoader<Keys extends string = string>
  extends DynamicPluginLoader<string | URLPatternInit, Keys> {}

/**
 * A registry for key-based resources.
 */
export interface URLBasedRegistry<Resource, Options extends readonly any[] = []>
  extends Registry<Resource, Options, string | URLPatternInit> {}

/**
 * A registry for key-based resources.
 */
export interface KeyBasedRegistry<Resource, Options extends readonly any[] = []>
  extends Registry<Resource, Options, string | RegExp> {}
